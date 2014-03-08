require({
        baseUrl: "src"
    }, [
        "odin/odin",
        "assets",
        "scene_level"
    ],
    function(Odin, assets, sceneLevel) {


        var game = new Odin.Game({
            debug: true,
            width: 960,
            height: 640,
            renderer: {
                autoClear: false,
                disableDepth: false
            }
        });

        game.addScene(sceneLevel);


        function startLevel() {
            game.setScene("Level");
            game.setCamera(game.scene.findByTagFirst("Camera"));
            var scene = game.scene,
                level = scene.findByTagFirst("Level").sprite;

            scene.on("update", function() {
                var sprites = game.scene.components.Sprite;

                sprites.sort(function(a, b) {

                    return a.transform2d.position.y - b.transform2d.position.y;
                });

                sprites.splice(sprites.indexOf(level), 1);
                sprites.push(level);
            });
        }


        Odin.AssetLoader.on("load", function() {

            game.on("start", startLevel).start();
        }).load();
    }
);
