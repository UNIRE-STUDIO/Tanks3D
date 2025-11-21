<script>
import Game from "./scripts/game";
import Config from "./scripts/config";
import UIFields from "./scripts/uiFields";
import MainScreen from "./components/MainScreen.vue";
import TopPanel from "./components/TopPanel.vue";
import PauseSceen from "./components/PauseSceen.vue";
import GameoverScreen from "./components/GameoverScreen.vue";
import WinScreen from "./components/WinScreen.vue";

let game = new Game();

export default {
	components: {
		MainScreen,
		TopPanel,
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
	<div v-if="uiFields.currentScreen === 0" id="background">
		<div id="left-dark-panel"></div>
	</div>
	<div class="ui">
		<div id="top">
			<div id="top-left">
				<button class="btn-mini" v-if="uiFields.currentScreen === 1" @click="gameLink.changeScreen(2)">❚❚</button>
				<button class="btn-mini" v-if="uiFields.currentScreen === 2" @click="gameLink.changeScreen(-1)">
					<svg width="35" height="50" viewBox="4 0 50 50" fill="161618" xmlns="http://www.w3.org/2000/svg">
						<path d="M35 50L11 25L35 0L40 4L20 25L40 45L35 50Z" />
					</svg>
				</button>
			</div>
			<div id="top-center">
				<div id="text-title">ТАНКИ 3D</div>
			</div>
			<div id="top-right"></div>
		</div>
		<div id="line"></div>

		<MainScreen v-if="uiFields.currentScreen === 0" :game="gameLink" />
		<PauseSceen v-if="uiFields.currentScreen === 2" :game="gameLink" />
		<WinScreen 	v-if="uiFields.currentScreen === 3" :game="gameLink" :uiFields="uiFields"/>
		<GameoverScreen v-if="uiFields.currentScreen === 4" :game="gameLink"/>
		<TopPanel v-if="uiFields.currentScreen >= 1" :game="gameLink" :uiFields="uiFields"/>
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
	background-size: auto;
	background-repeat: no-repeat;
	background-image: url('/sprites/bg.jpg');
	background-position: bottom -100px left 50%;

	animation: pulse 15s ease-in-out infinite;
}

@keyframes pulse {
	0% {
		transform: scale(1);
		background-position: bottom -100px left 50%;
	}
	20% {
		background-position: bottom -150px left 50%;
		transform: scale(1);
	}
	40%{
		background-position: bottom -150px left 50%;
		transform: scale(1.1);
	}
	60%{
		background-position: bottom -150px left 50%;
		transform: scale(1);
	}
	80%{
		background-position: bottom -100px left 50%;
		transform: scale(1);
	}
	100%{
		transform: scale(1);
		background-position: bottom -100px left 50%;
	}
}

#left-dark-panel{
	width: 27%;
	height: 100%;
	background: linear-gradient(to right, rgba(0, 0, 0, 0.63), rgba(0, 0, 0, 0));
}

.ui {
	position: absolute;
	height: 100%;
	width: 100%;
	display: flex;
	flex-direction: column;
}

/* #top {
	padding: 8px 16px;
	display: grid;
	grid-template-columns: 1fr 3fr 1fr;
} */

#top-left{
	text-align: left;
	grid-column-start: 1;
}

#top-center{
	grid-column-start: 2;
}

#top-right{
	grid-column-start: 3;
}

</style>
