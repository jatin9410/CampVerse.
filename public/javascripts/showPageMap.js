mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
container: 'map', // container ID
style: 'mapbox://styles/mapbox/satellite-v9', // style URL
center: campground.geometry.coordinates, // starting position [lng, lat]
zoom: 10 // starting zoom
});

new mapboxgl.Marker()
  .setLngLat(campground.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 20 })
      .setHTML(
        `<h3> ${campground.title}</h3><p>${campground.location}</p>`
      )
  )
  .addTo(map)
