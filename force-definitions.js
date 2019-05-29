const forceDefinitions = (function(){
    const geoPositionForce = (function(projection) {
        const force = (alpha) => {
            if(force.savedNodes && force.savedNodes.length) {
                for(const node of force.savedNodes) {
                    if(node.lat !== undefined) {
                        const target = projection([node.lng, node.lat]);
                        const difference = {
                            x: target[0] - node.x,
                            y: target[1] - node.y
                        };

                        node.x += difference.x * alpha * force.currentStrength;
                        node.y += difference.y * alpha * force.currentStrength;
                    }
                }
            }
        };

        force.savedNodes = [];
        force.strencurrentStrengthgth = 1;

        force.initialize = (nodes) => {
            if(!nodes || !nodes.length) {
                return;
            }
            force.savedNodes = nodes;
        };

        force.strength = (strength) => {
            force.currentStrength = strength;
            return force;
        };

        return force;
    });

    const centeringForce = (function(cx, cy) {
        const force = (alpha) => {
            if(force.savedNodes && force.savedNodes.length) {
                for(const node of force.savedNodes) {
                    const difference = {
                        x: cx - node.x,
                        y: cy - node.y
                    };
                    const differenceLength = Math.sqrt(Math.pow(difference.x, 2) + Math.pow(difference.y, 2));
                    const normalizedDifference = {
                        x: difference.x / differenceLength,
                        y: difference.y / differenceLength
                    };

                    node.x += normalizedDifference.x * Math.pow(differenceLength, 1.4) * alpha * force.currentStrength;
                    node.y += normalizedDifference.y * Math.pow(differenceLength, 1.4) * alpha * force.currentStrength;
                }
            }
        };

        force.savedNodes = [];
        force.strencurrentStrengthgth = 1;

        force.initialize = (nodes) => {
            if(!nodes || !nodes.length) {
                return;
            }
            force.savedNodes = nodes;
        };

        force.strength = (strength) => {
            force.currentStrength = strength;
            return force;
        };

        return force;
    });

    return {
        geoPositionForce,
        centeringForce
    };
})();