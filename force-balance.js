const ForceBalance = (function(projection){
    const svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

    const geoPositionForce = forceDefinitions.geoPositionForce;
    const centeringForce = forceDefinitions.centeringForce;

    const forceMapStrengths = {
        link: 0,
        charge: 0,
        radial: 0,
        geoPosition: 1,
        mapOpacity: 1,
        center: 0
    };

    const forceAuthorshipStrengths = {
        link: 0.6,
        charge: -30,
        radial: 0,//0.07,
        geoPosition: 0,
        mapOpacity: 0,
        center: 0.015
    };

    function forceSelection(mapPortion){
        return {
            link: forceMapStrengths.link * mapPortion + forceAuthorshipStrengths.link * (1 - mapPortion),
            charge: forceMapStrengths.charge * mapPortion + forceAuthorshipStrengths.charge * (1 - mapPortion),
            radial: forceMapStrengths.radial * mapPortion + forceAuthorshipStrengths.radial * (1 - mapPortion),
            geoPosition: forceMapStrengths.geoPosition * mapPortion + forceAuthorshipStrengths.geoPosition * (1 - mapPortion),
            mapOpacity: forceMapStrengths.mapOpacity * mapPortion + forceAuthorshipStrengths.mapOpacity * (1 - mapPortion),
            center: forceMapStrengths.center * mapPortion + forceAuthorshipStrengths.center * (1 - mapPortion),
        }
    }

    const slider = document.getElementById("myRange");
    let forceSettings = forceSelection(slider.value);
    let previousSliderValue = slider.value;

    slider.oninput = function() {
        const sliderValue = this.value;
        const difference = Math.abs(previousSliderValue - sliderValue);
        const newAlpha = simulation.alpha()+difference;
        previousSliderValue = sliderValue;
        simulation.alpha(newAlpha).restart();
        forceSettings = forceSelection(this.value);
        applyStrengths(forceSettings);

        document.getElementById('map-background').style.opacity = forceSettings.mapOpacity;
    };

    const  simulation = d3.forceSimulation().alphaDecay(0.02);

    const forceLink = d3.forceLink().id(function(d) { return d.id; });
    const forceManyBody = d3.forceManyBody();
    const forceCollide = d3.forceCollide().radius(function(d) {
        return Math.sqrt(30 * d.paperIndex.length)
    });
    const forceRadial = d3.forceRadial(300, width / 2, height / 2);
    const forceGeo = geoPositionForce(projection);
    const forceCenter = centeringForce(width / 2, height / 2);

    function applyStrengths(strength) {
        simulation.force("link", forceLink.strength(strength.link))
            .force("charge", forceManyBody.strength(strength.charge))
            .force('collision', forceCollide)
            .force("radial", forceRadial.strength(strength.radial))
            .force("center", forceCenter.strength(strength.center))
            .force('geoposition', forceGeo.strength(strength.geoPosition));
    }
    applyStrengths(forceSettings);

    return {
        simulation
    };
});