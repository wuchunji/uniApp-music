<template>
	<view class="music-head"  :style="{color:color}">
		<view v-if="icon" class="music-head-icon" :class="{'music-head-iconblack' : true}">
			<text class="iconfont icon-zuojiantou" @click="handleToBack"></text> | <text class="iconfont icon-shouye" @click="handleToHome"></text>
		</view>
		{{title}}
	</view>
</template>

<script>
	export default {
		name:"musichead",
		data() {
			return {
				
			};
		},
		props:['title', 'icon','color','iconblack'],
		methods:{
			handleToBack() {
				uni.navigateBack();
			},
			handleToHome() {
				uni.navigateTo({
					url:'../../pages/index/index'
				})
			}
		}
	}
</script>

<style scoped>
	.music-head{
		width: 100%;
		height: 75px;
		font-size: 16px;
		line-height: 80px;
		text-align: center;
		color: #000;
		position: relative;
	}
	.music-head-icon{
		position: absolute;
		left: 8px;
		top: 26px;
		width: 90px;
		height: 31px;
		background-color: rgba(0,0,0,0.4);
		color: #fff;
		line-height: 31px;
		border-radius: 15px;
		display: flex;
		justify-content: space-evenly;
	}
	.music-head-iconblack{
		color: #000000;
		border: 1px solid #eaeaea;
		background-color: #fff;
	}
</style>
