<template>
	<view class="detail">
		<view class="fixbg" :style="{'background-image' : 'url(' +songDetail.al.picUrl+ ')' }"></view>
		<musichead :title="songDetail.name" :icon="true" color="white"></musichead>
		
		<view class="container" v-show="!isLoading">
			<scroll-view scroll-y="true" >
				
				<!-- 动画区 -->
				<view class="detail-play" @tap="handleToPlay">
					<image :src="songDetail.al.picUrl" :class="{'detail-play-run' : isPlayRoute}" mode=""></image>
					<text class="iconfont" :class="iconplay"></text>
					<view></view>
				</view>
				
				<!-- 歌词区 -->
				<view class="detail-lyric">
					<view class="detail-lyric-wrap" :style="{transform : 'translateY(' + -(lyricIndex - 1) * 82 + 'rpx)'}">
						<view class="detail-lyric-item" :class="{active : lyricIndex == index}" v-for="(item, index) in songLyric" :key="index">
							{{item.lyric}}
						</view>
					</view>
				</view>
				
				<!-- 关联区 -->
				<view class="detail-like">
					<view class="detail-like-head">
						喜欢这首歌的人也听
					</view>
					
					<view class="detail-like-item" v-for="(item, index) in songSimi" :key="index" @tap="handleToSimi(item.id)">
						<view class="detail-like-img">
							<image :src="item.album.picUrl" mode=""></image>
						</view>
						<view class="detail-like-song">
							<view>{{item.name}}</view>
							<view>
								<image v-if="item.privilege.flag > 60 && item.privilege.flag < 70" src="../../static/dujia.png" mode=""></image>
								<image v-if="item.privilege.maxbr == 999000" src="../../static/sq.png" mode=""></image>
								{{item.album.artists[0].name}} - {{item.name}}
							</view>
						</view>
						<text class="iconfont icon-bofang1"></text>
					</view>
					
				</view>
				
				<!-- 评论区 -->
				<view class="detail-comment">
					<view class="detail-comment-head">
						精彩评论
					</view>
					
					<view class="detail-comment-item" v-for="(item, index) in songComment" :key="index">
						<!-- 左侧头像 -->
						<view class="detail-comment-img">
							<image :src="item.user.avatarUrl" mode=""></image>
						</view>
						<!-- 右侧评论 -->
						<view class="detail-comment-content">
							<!-- 评论头部 -->
							<view class="detail-comment-title">
								<view class="detail-comment-name">
									<view>{{item.user.nickname}}</view>
									<view>{{item.time | formatTime}}</view>
								</view>
								<view class="detail-comment-like">
									{{item.likedCount | formatCount}}
									<text class="iconfont icon-dianzan"></text>
								</view>
							</view>
							
							<!-- 评论内容 -->
							<view class="detail-comment-text">
								{{item.content}}
							</view>
						</view>
					</view>
					
				</view>
				
			</scroll-view>
		</view>
		
		
	</view>
</template>

<script>
	import '@/common/iconfont.css'
	import musichead from '../../components/musichead/musichead.vue'
	import {songDetail, songUrl, songLyric, songSimi, songComment} from '../../common/api.js'
	
	export default {
		data() {
			return {
				songDetail: {
					al:{
						picUrl: '',
					}
				},
				songSimi: [],
				songComment: [],
				songLyric: [],
				lyricIndex: 0,
				bgAudioManager: {},
				iconplay: 'icon-iconfront-',
				isPlayRoute: true,
				isLoading: true,
			}
		}, 
		components:{musichead},
		onLoad(options) {
			// console.log(options.songId);
			this.getMusic(options.songId);
			
		},
		// 离开界面时
		onUnload() {
			this.cancelLyricIndex();
			
			// h5端离开页面时销毁  避免用户不暂停播放就直接返回首页 
			// #ifdef H5
				this.bgAudioManager.destroy();
			// #endif
		},
		onHide() {
			this.cancelLyricIndex();
			// #ifdef H5
				this.bgAudioManager.destroy();
			// #endif
		},
		
		methods: {
			// 接收歌曲ID 从接口拿到数据 渲染页面
			getMusic(songId) {
				
				// 开始拿数据时 先调用vuex方法 获取到这首歌所在列表下一首歌的id
				this.$store.commit('NEXT_ID', songId);
				
				
				// 开始拿数据时开启等待  isLoading设置为true不让页面显示
				uni.showLoading({
					title: '加载中...',
				});
				this.isLoading = true;
				
				// 我们希望所有的数据都获取再渲染 所有采用promise.all方法
				Promise.all([ songDetail(songId), songSimi(songId), songComment(songId), songLyric(songId), songUrl(songId) ]).then(res => {
					// res[0] 指的是all方法传进来第一个函数的成功返回值
					// console.log(res);
					if(res[0][1].data.code == 200) {
						this.songDetail = res[0][1].data.songs[0];
					}
					if(res[1][1].data.code == 200) {
						this.songSimi = res[1][1].data.songs;
					}
					if(res[2][1].data.code = 200) {
						this.songComment = res[2][1].data.hotComments;
					}
					if(res[3][1].data.code = 200) {
						let lyric = res[3][1].data.lrc.lyric;
						let re = /\[([^\]]+)\]([^\[]+)/g;
						// 正则表达式/.../g  1.'\[' 先匹配一个 '['   2.'([  ^\]  ]+)' 匹配除了']'的字符一个或多个
						//                 	3. '\]' 再匹配一个 ']'   4. '([  ^\[  ]+)' 匹配除了'['的字符一个或多个
						var result = [];
						lyric.replace(re, ($0, $1, $2) => {
							result.push({'time': this.formatTimeToSec($1), 'lyric': $2});
						});
						this.songLyric = result; 
					}
					if(res[4][1].data.code == 200) {
						
						// 微信端适配
						// #ifdef MP-WEIXIN
							this.bgAudioManager = uni.getBackgroundAudioManager();
							this.bgAudioManager.title = this.songDetail.name;
						// #endif
						
						// H5端适配
						// #ifdef H5
							if(this.bgAudioManager) {
								this.bgAudioManager = uni.createInnerAudioContext();
							}
							this.iconplay = 'icon-bofang1';
							this.isPlayRoute = false;
						// #endif
						
						
						this.bgAudioManager.src = res[4][1].data.data[0].url || '';
						this.listenLyricIndex();
						// 内置的监听方法 当播放时
						this.bgAudioManager.onPlay(() => {
							this.iconplay = 'icon-iconfront-';
							this.isPlayRoute = true;
							// 调用歌词滚动函数
							this.listenLyricIndex();
						});
						// 内置的监听方法 当暂停时
						this.bgAudioManager.onPause(() => {
							this.iconplay = 'icon-bofang1';
							this.isPlayRoute = false;
							// 暂停时清除滚动定时器
							this.cancelLyricIndex();
						});
						
						// 内置的监听方法 当这首歌播放完毕时 自动跳转到列表下一首歌
						this.bgAudioManager.onEnded(() => {
							this.getMusic(this.$store.state.nextId);
						})
					}
					
					// 拿完数据渲染完 将isLoading设置为FALSE 同时关闭Londing功能
					this.isLoading = false;
					uni.hideLoading();
				});
			},
			// 将时间戳处理成秒
			formatTimeToSec(value) {
				let arr = value.split(':');
				return parseFloat(arr[0]*60) + Number(parseFloat(arr[1]).toFixed(1));
			},
			// 控制歌曲动画区点击事件
			handleToPlay() {
				// 下面用的API全部是内置的
				if(this.bgAudioManager.paused) {
					this.bgAudioManager.play();
				}
				else{
					this.bgAudioManager.pause();
				}
			},
			// 设置定时器 控制歌词滚动
			listenLyricIndex() {
				// 先关闭所有定时器 避免有多个定时器同时开启
				clearInterval(this.timer);
				this.timer = setInterval(() => {
					for(let i = 0; i<this.songLyric.length; i++) {
						// 判断如果播放到比最后一句的时间还要长 那么歌词切到最后一句 跳出循环 
						// 设置这个是为了避免 如果不设置 后面的if判断到最后一句还会i+1 这时就会超出songLyric的长度 会报错
						if(this.bgAudioManager.currentTime > this.songLyric[this.songLyric.length-1].time) {
							this.lyricIndex = this.songLyric.length-1;
							break;
						}
						
						//this.bgAudioManager.currentTime返回当前音乐播放到多少秒
						if(this.bgAudioManager.currentTime > this.songLyric[i].time 
						&& this.bgAudioManager.currentTime < this.songLyric[i+1].time) {
							this.lyricIndex = i;
						}
						
					}
				},500);
			},
			// 取消定时器
			cancelLyricIndex() {
				clearInterval(this.timer);
			},
			// 关联区点击切换歌曲
			handleToSimi(songId) {
				// 获取新的歌曲id 调用getMusic重新渲染页面
				this.getMusic(songId);
			}
		}
	}
</script>

<style scoped>
	/* 动画播放区 */
	.detail-play{
		width: 580rpx;
		height: 580rpx;
		background: url(~@/static/disc.png);
		background-size: cover;
		margin: 214rpx auto 0 auto;
		position: relative;
	}
	.detail-play image{
		width: 370rpx;
		height: 370rpx;
		border-radius: 50%;
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		margin: auto;
		/* 旋转动画 */
		animation: 10s linear move infinite;
		/* 开始状态为暂停 */
		animation-play-state: paused;
	}
	.detail-play .detail-play-run{
		animation-play-state: running;
	}
	@keyframes move{
		from{ transform: rotate(0deg); }
		to{ transform: rotate(360deg); }
	}
	
	.detail-play text{
		width: 100rpx;
		height: 100rpx;
		font-size: 100rpx;
		color: #fff;
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		margin: auto;
	}
	.detail-play view{
		width: 230rpx;
		height: 360rpx;
		background: url(~@/static/needle.png);
		position: absolute;
		left: 100rpx;
		right: 0;
		top: -200rpx;
		margin: auto;
		background-size: cover;
	}
	
	/* 歌词区域 */
	.detail-lyric{
		font-size: 32rpx;
		line-height: 82rpx;
		height: 246rpx;
		text-align: center;
		overflow: hidden;
		color: #919193;
	}
	.detail-lyric-wrap{
		transition: .5s;
	}
	.detail-lyric-item{
		height: 82rpx;
	}
	.detail-lyric-item.active{
		color: #fff;
	}
	
	/* 关联区域 */
	.detail-like{
		margin: 0 30rpx;
	}
	.detail-like-head{
		font-size: 36rpx;
		color: #fff;
		margin: 50rpx 0;
	}
	.detail-like-item{
		display: flex;
		align-items: center;
		margin-bottom: 28rpx;
	}
	.detail-like-img{
		width: 82rpx;
		height: 82rpx;
		border-radius: 20rpx;
		overflow: hidden;
		margin-right: 20rpx;
	}
	.detail-like-img image{
		width: 100%;
		height: 100%;
	}
	.detail-like-song{
		flex: 1;
		color: #c6c2bf;
	}
	.detail-like-song view:nth-child(1){
		font-size: 28rpx;
		color: #fff;
		margin-bottom: 12rpx;
	}
	.detail-like-song view:nth-child(2){
		font-size: 22rpx;
	}
	.detail-like-song image{
		width: 26rpx;
		height: 20rpx;
		margin-right: 10rpx;
	}
	.detail-like-item text{
		font-size: 50rpx;
		color: #c6c2bf;
	}
	
	/* 评论区 */
	.detail-comment{
		margin: 0 30rpx;
	}
	.detail-comment-head{
		font-size: 36rpx;
		color: #fff;
		margin: 50rpx 0;
	}
	.detail-comment-item{
		margin-bottom: 28rpx;
		display: flex;
	}
	.detail-comment-img{
		width: 64rpx;
		height: 64rpx;
		border-radius: 50%;
		overflow: hidden;
		margin-right: 19rpx;
	}
	.detail-comment-img image{
		width: 100%;
		height: 100%;
	}
	.detail-comment-content{
		flex: 1;
		color: #cbcacf;
	}
	.detail-comment-title{
		display: flex;
		justify-content: space-between;
	}
	.detail-comment-name{}
	.detail-comment-name view:nth-child(1){
		font-size: 26rpx;
	}
	.detail-comment-name view:nth-child(2){
		font-size: 20rpx;
	}
	.detail-comment-like{
		font-size: 28rpx;
	}
	.detail-comment-text{
		font-size: 28rpx;
		line-height: 40rpx;
		color: #fff;
		margin-top: 20rpx;
		border-bottom: 1px solid #e0e0e0;
		padding-bottom: 40rpx;
	}
</style>
