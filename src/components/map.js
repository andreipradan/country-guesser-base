import {useEffect, useLayoutEffect, useState} from "react";

import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import {useDispatch, useSelector} from 'react-redux'
import {
  clearFoundCountries,
  removeCountry,
  setCountries
} from "../redux/features/currentMap";

const secondsToTime = secs => {
  let hours = Math.floor(secs / (60 * 60));

  let divisor_for_minutes = secs % (60 * 60);
  let minutes = Math.floor(divisor_for_minutes / 60);

  let divisor_for_seconds = divisor_for_minutes % 60;
  let seconds = Math.ceil(divisor_for_seconds);

  return {
    "h": hours,
    "m": minutes,
    "s": seconds
  };
}

const inGameTemplateConfig = {
  tooltipText: "{name} {id} {columnSettings.fill}",
      interactive: true,
      templateField: "columnSettings",
      fill: am5.color(0xaaaaab)
}

const Map = () => {
  const worldCountries = am5geodata_worldLow.features
  const [series, setSeries] = useState(null)
  const [counter, setCounter] = useState(0)
  const [inProgress, setInProgress] = useState(false)

  const dispatch = useDispatch()
  const countries = useSelector(state => state.map.countries)
  const foundCountries = useSelector(state => state.map.foundCountries)

  const newGame = () => {
    setCounter(300)
    dispatch(setCountries(am5geodata_worldLow.features.map(f => {
      return {id: f.properties.id, name: f.properties.name}
    })))
    dispatch(clearFoundCountries())
  }

  const startStopGame = () => {
    setInProgress(!inProgress)
    if (!inProgress) newGame()
  }
  useEffect(() => {
    inProgress && setTimeout(() => {
      setCounter(counter - 1)
      if (counter < 1) setInProgress(false)
    }, 1000)
  });

  useEffect(() => {
    if (!series) return
    const data = worldCountries.map(c => {
      const props = {
        id: c.properties.id,
        name: c.properties.name,
        columnSettings: null
      }
      if (foundCountries?.includes(c.properties.name))
        props["columnSettings"] = {
          fill: am5.color("#1246c9")
        }
      return props
    })
    series.data.setAll(data)
  }, [foundCountries])

	useLayoutEffect(() => {
    newGame()
    const root = am5.Root.new("chartdiv")
    root.setThemes([am5themes_Animated.new(root)])

    let chart = root.container.children.push(
      am5map.MapChart.new(root, {
        projection: am5map.geoNaturalEarth1(),
        panX: "none",
        panY: "none",
        wheelY: "none"
      })
    );

    const series = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldLow,
        exclude: ['AQ']
      }),
    );
    setSeries(series)

    const template = series.mapPolygons.template
    template.setAll(inGameTemplateConfig)

    // template.states.create("hover", {
    //   fill: am5.color(0xaaaaab)
    // })
    return () => root.dispose()
  }, [])

  const time = secondsToTime(counter)
	return <div style={{marginTop: "1%"}}>
    <div>Remaining: {countries?.length}</div>
    {
      inProgress && <div>Time left: {time.m}m:{time.s}s</div>
    }
    <div>Score: {foundCountries?.length || 0}</div>
    <button onClick={startStopGame}>{inProgress ? 'Stop': 'Start'}</button>
    <div>
      <br />
      {inProgress && <input
        placeholder={"Country"}
        onInput={(e) => {
          const text = e.target.value.toLowerCase()
          if (countries.map(c => c.name.toLowerCase()).includes(text)) {
            dispatch(removeCountry(text))
            e.target.value = ""
          }
        }}
      />}
    </div>

    <div id="chartdiv" style={{ width: "100%", height: "500px" }} />
  </div>
}

export default Map
