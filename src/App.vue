<script>
import Game from "./scripts/game.js";
import Config from "./scripts/config.js";
import UIFields from "./scripts/uiFields.js";
import MainScreen from "./components/MainScreen.vue";
import PlayScreen from "./components/PlayScreen.vue";
import PauseSceen from "./components/PauseSceen.vue";
import GameoverScreen from "./components/GameoverScreen.vue";
import WinScreen from "./components/WinScreen.vue";
import WinScreen from "./components/WinScreen.vue";

let game = new Game();

export default {
	components: {
		MainScreen,
		PlayScreen,
		PauseSceen,
		WinScreen,
		GameoverScreen
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
	<div v-if="uiFields.currentScreen === 0" id="background"></div>
	<div class="ui">
		<div id="top">
			<button class="btn-mini" v-if="uiFields.currentScreen === 1" @click="gameLink.changeScreen(2)">❚❚</button>
			<button class="btn-mini" v-if="uiFields.currentScreen === 2" @click="gameLink.changeScreen(-1)">
				<svg width="35" height="50" viewBox="4 0 50 50" fill="161618" xmlns="http://www.w3.org/2000/svg">
					<path d="M35 50L11 25L35 0L40 4L20 25L40 45L35 50Z" />
				</svg>
			</button>
		</div>
		<MainScreen v-if="uiFields.currentScreen === 0" :game="gameLink" />
		<PlayScreen v-if="uiFields.currentScreen === 1" :game="gameLink" />
		<PauseSceen v-if="uiFields.currentScreen === 2" :game="gameLink" />
		<WinScreen 	v-if="uiFields.currentScreen === 3" :game="gameLing" />
		<GameoverScreen v-if="uiFields.currentScreen === 4" :game="gameLink"/>
	</div>
</template>

<style scoped>
.canvas {
	background-color: rgb(103, 148, 173);
}

#background {
	position: absolute;
	height: 100%;
	width: 100%;
	background-size: cover;
	background-repeat: no-repeat;
	background-image: url('/sprites/bg.jpg');
}

.ui {
	position: absolute;
	height: 100%;
	width: 100%;
}

#top {
	padding: 8px 16px;
	text-align: left;
}
</style>
