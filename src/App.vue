<script>
import Game from "./scripts/game.js";
import Config from "./scripts/config.js";
import UIFields from "./scripts/uiFields.js";
import MainScreen from "./components/MainScreen.vue";
import PlayScreen from "./components/PlayScreen.vue";

let game = new Game();

export default {
	components: {
		MainScreen,
		PlayScreen
	},
	data() {
		return {
			config: null,
			uiFields: new UIFields(),
			gameLink: game
		}
	},
	mounted() {
		this.config = new Config();
		game.init(this.config, this.uiFields);
	},
	methods: {
	}
}
</script>

<template>
	<canvas class="canvas"></canvas>
	<div class="ui">
		<MainScreen v-if="uiFields.currentScreen === 0" :game="gameLink" />
		<PlayScreen v-if="uiFields.currentScreen === 1" :game="gameLink" />
	</div>
</template>

<style scoped>
.ui {
	position: absolute;
	height: 100%;
	width: 100%;
}
</style>
