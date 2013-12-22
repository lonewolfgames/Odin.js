if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(
    function(require) {
        "use strict";

		
		function Odin() {
			
			this.Class = require("base/class");
			this.Device = require("base/device");
			this.Dom = require("base/dom");
			this.EventEmitter = require("base/event_emitter");
			this.ObjectPool = require("base/object_pool");
			this.requestAnimationFrame = require("base/request_animation_frame");
			this.Time = require("base/time");
			
			this.Asset = require("core/assets/asset");
			this.AssetLoader = require("core/assets/asset_loader");
			this.Assets = require("core/assets/assets");
			this.AudioClip = require("core/assets/audio_clip");
			this.SpriteSheet = require("core/assets/sprite_sheet");
			this.Texture = require("core/assets/texture");
			
			this.AudioSource = require("core/components/audio_source");
			this.Camera = require("core/components/camera");
			this.Camera2D = require("core/components/camera2d");
			this.Component = require("core/components/component");
			this.Sprite2D = require("core/components/sprite2d");
			this.Transform = require("core/components/transform");
			this.Transform2D = require("core/components/transform2d");
			
			this.Game = require("core/game/game");
			this.ClientGame = require("core/game/client_game");
			this.Log = require("core/game/log");
			
			this.Handler = require("core/input/handler");
			this.Input = require("core/input/input");
			
			this.CanvasRenderer2D = require("core/rendering/canvas_renderer_2d");
			this.WebGLRenderer2D = require("core/rendering/webgl_renderer_2d");
			
			this.GameObject = require("core/game_object");
			this.Scene = require("core/scene");
			
			this.AABB2 = require("math/aabb2");
			this.AABB3 = require("math/aabb3");
			this.Color = require("math/color");
			this.Mat2 = require("math/mat2");
			this.Mat3 = require("math/mat3");
			this.Mat32 = require("math/mat32");
			this.Mat4 = require("math/mat4");
			this.Mathf = require("math/mathf");
			this.Quat = require("math/quat");
			this.Vec2 = require("math/vec2");
			this.Vec3 = require("math/vec3");
			this.Vec4 = require("math/vec4");
			
			if (this.Device.mobile) {
				window.onerror = function(message,page,line,chr) {
					alert("line: "+ line +", page: "+ page +"\nmessage: "+ message);
				};
			}
		}
		
		
		Odin.prototype.globalize = function() {
			
            for (var key in this) window[key] = this[key];
            window.Odin = this;
        };
		
        return new Odin;
    }
);