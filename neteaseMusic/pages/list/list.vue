<template>
	<view class="list">
		<view class="fixbg" :style="{'background-image' : 'url(' +playlist.coverImgUrl+ ')' }"></view>
		<musichead title="歌单" :icon="true" color="white"></musichead>
		<!-- 添加一个isLoading等待数据传好了渲染好了再展示 避免页面显示有卡顿 -->
		<view class="container" v-show="!isLoading">
			<scroll-view scroll-y="true" >
				<view class="list-head">
					
					<view class="list-head-img">
						<image :src="playlist.coverImgUrl" mode=""></image>
						<text class="iconfont icon-yousanjiao">{{playlist.playCount | formatCount}}</text>
					</view>
					
					<view class="list-head-text">
						<view>{{playlist.name}}</view>
						<view>
							<image :src="playlist.creator.avatarUrl" mode=""></image>
							{{playlist.creator.nickname}}
						</view>
						<view>
							{{playlist.description}}
						</view>
					</view>
									
				</view>
				
				<!-- 条件编译 针对不同的平台做差异化处理 -->
				<!-- #ifdef MP-WEIXIN -->
				<button class="list-share" open-type="share">
					<text class="iconfont icon-fenxiang"></text>分享给微信好友
				</button>
				<!-- #endif -->
				
				<view class="list-music">
					<view class="list-music-head">
						<text class="iconfont icon-bofang"></text>
						<text>播放全部</text>
						<text>(共{{playlist.trackCount}}首)</text>
					</view>
					
					<view class="list-music-item" v-for="(item, index) in playlist.tracks" :key="index"  @tap="handleToDetail(item.id)">
						<view class="list-music-top">{{index+1}}</view>
						
						<view class="list-music-song">
							<view>{{item.name}}</view>
							<view>
								<image v-if="privileges[index].flag > 60 && privileges[index].flag < 70" src="../../static/dujia.png" mode=""></image>
								<image v-if="privileges[index].maxbr == 999000" src="../../static/sq.png" mode=""></image>
								{{item.ar[0].name}} - {{item.name}}
							</view>						
						</view>
						
						<text class="iconfont icon-bofang1"></text>
					</view>
					
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script>
	import '@/common/iconfont.css'
	import musichead from '../../components/musichead/musichead.vue'
	import {list} from '../../common/api.js'
	
	export default {
		data() {
			return {
				playlist: {
					creator: {
						avatarUrl:''
					},
					coverImgUrl: '',
				},
				privileges: [],
				isLoading: true,
			}
		},
		components:{musichead},
		onLoad(options) {
			
			// 添加loading效果
			uni.showToast({
				title: '正在加载...',
			})
			
			// console.log(options.listId);
			// onLoad函数第一个参数接收的是query参数
			list(options.listId).then(res => {
				// 判断是否数据成功返回接收
				if(res[1].data.code == '200') {
					// 接收服务器返回的数据，根据不同的数据对页面进行不同的渲染
					this.playlist = res[1].data.playlist;
					this.privileges = res[1].data.privileges;
					// 调用vuex 让歌单列表传到vuex
					this.$store.commit('INIT_TOPLISTIDS', res[1].data.playlist.trackIds); 
					
					// 数据接收完毕后取消loading效果并显示页面
					uni.hideLoading();
					this.isLoading = false;		
				}
			})
		},
		methods: {
			handleToDetail(songId) {
				uni.navigateTo({
					url: '/pages/detail/detail?songId=' + songId,
				})
			}
		}
	}
</script>

<style scoped>
	.list-head{
		display: flex;
		margin: 30rpx;
	}
	.list-head-img{
		width: 264rpx;
		height: 264rpx;
		border-radius: 30rpx;
		overflow: hidden;
		position: relative;
	}
	.list-head-img image{
		width: 100%;
		height: 100%;
	}
	.list-head-img text{
		position: absolute;
		right: 8rpx;
		top: 8rpx;
		color: white;
		font-size: 26rpx;
	}
	
	.list-head-text{
		flex: 1;
		margin-left: 42rpx;
		color: #f0f2f7;
	}
	.list-head-text view:nth-child(1){
		color: #fff;
		font-size: 34rpx;
	}
	.list-head-text view:nth-child(2){
		display: flex;
		align-items: center;
		margin: 20rpx 0;
		font-size: 24rpx;
		
	}
	.list-head-text view:nth-child(2) image{
		width: 54rpx;
		height: 54rpx;
		border-radius: 50%;
		margin-right: 14rpx;
	}
	.list-head-text view:nth-child(3){
		line-height: 34rpx;
		font-size: 22rpx;
	}
	
	/* 分享按钮样式 */
	.list-share{
		width: 330rpx;
		height: 74rpx;
		margin: 0 atuo;
		background-color: rgba(0,0,0,0.4);
		border-radius: 37rpx;
		color: white;
		text-align: center;
		line-height: 74rpx;
		font-size: 28rpx;
	}
	.list-share text{
		margin-right: 16rpx;
	}
	
	/* 列表音乐样式 */
	.list-music{
		background-color: #fff;
		border-radius: 50rpx;
		margin-top: 40rpx;
		/* 触发父容器bfc模型 解决margin合并 */
		overflow: hidden;
	}
	.list-music-head{
		height: 50rpx;
		margin: 30rpx 0 70rpx 22rpx;
	}
	.list-music-head text:nth-child(1){
		height: 50rpx;
		font-size: 50rpx;
	}
	.list-music-head text:nth-child(2){
		font-size: 30rpx;
		margin: 0 10rpx 0 26rpx;
	}
	.list-music-head text:nth-child(3){
		font-size: 26rpx;
		color: #b2b2b2;
	}
	.list-music-item{
		display: flex;
		margin: 0 32rpx 66rpx 46rpx;
		align-items: center;
		color: #959595;
	}
	.list-music-top{
		width: 58rpx;
		font-size: 30rpx;
		line-height: 30rpx;
	}
	.list-music-song{
		flex: 1;
	}
	.list-music-song view:nth-child(1){
		font-size: 28rpx;
		color: #000;
		width: 70vw;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.list-music-song view:nth-child(2){
		align-items: center;
		font-size: 20rpx;
		width: 70vw;
		white-space: nowrap;
		overflow: hidden;
		text-overflow:ellipsis;
	}
	.list-music-song view:nth-child(2) image{
		width: 32rpx;
		height: 20rpx;
		margin-right: 10rpx;
		flex-shrink: 0;
	}
	.list-music-item text{
		font-size: 50rpx;
		color: #c7c7c7;
	}
</style>
