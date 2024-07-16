<script>
import Game from "./scripts/game.js";
import Config from "./scripts/config.js";
import UIFields from "./scripts/uiFields.js";

export default {
	components: {

	},
	data() {
		return {
			config: null,
			uiFields: new UIFields(),
			game: new Game(),
		}
	},
	mounted() {
		this.config = new Config();
		this.game.init(this.config, this.uiFields);
	},
	methods: {
	}
}
</script>

<template>
	<!-- <canvas ref="myCanvas" id="myCanvas"></canvas> -->
</template>

<style scoped>
/* #myCanvas {
	position: absolute;
	width: 100%;
	height: 100%;
	background-color: #2d2d2d;
} */
</style>
