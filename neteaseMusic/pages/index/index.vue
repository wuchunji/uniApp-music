<template>
	<view class="index">
		<musichead title="笑嘻嘻音乐" :icon="false"></musichead>
		<view class="container">
			<scroll-view scroll-y="true">
				<view class="index-search" @tap="handleToSearch">
					<text class="iconfont icon-fangdajing"></text>
					<input type="text" placeholder="搜索歌曲" />
				</view>
				
				 <view v-if="isLoading">
					 <!-- row 是 选择有几行     isarc 选择是圆还是方块     v-for="(item,key) in 4" 循环几个 -->
				    <m-for-skeleton
				        :avatarSize="200"
				        :row="3"
				        :loading="isLoading"
				        isarc="square"
				        v-for="(item,key) in 4"
						:titleStyle="{}"
						:title="false"
				        :key="key">
				    </m-for-skeleton>
				</view>
				
				<view class="index-list" v-else>
					
					
					<view class="index-list-item" v-for="(item, index) in topList" :key="index" @tap="handleToList(item.listId)">
						<view class="index-list-img">
							<image :src="item.coverImgUrl" mode=""></image>
							<text>{{item.updateFrequency}}</text>
						</view>
						<view class="index-list-text">
							<view v-for="(item, index) in item.tracks" :key="index">{{index + 1}}.{{item.first}} - {{item.second}}</view>
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
	import {topList} from '../../common/api.js'
	import mForSkeleton from "@/components/m-for-skeleton/m-for-skeleton";
	
	export default {
		data() {
			return { 
				topList: [],
				isLoading: true,
			}
		},
		components:{
			musichead,
			mForSkeleton
		},
		onLoad() {
			topList().then((res) => {
				if(res.length) {
					// 设置一个定时器 模拟一个延时接收数据 以显示查看骨架屏效果
					setTimeout(()=>{
						this.topList = res;
						this.isLoading = false;
					}, 1000)
				}
			});
		},
		methods: {
			handleToList(listId) {
				// 事件触发后，接收对应接口id值，跳转到相对应的url
				uni.navigateTo({
					// 通过query参数给list传入对应的listId
					url:'/pages/list/list?listId=' + listId,
				})
			},
			handleToSearch() {
				// 事件触发后，接收对应接口id值，跳转到相对应的url
				uni.navigateTo({
					// 通过query参数给list传入对应的listId
					url:'../search/search',
				})
			},
		}
	}
</script>

<style scoped>
	.index{}
	/* 搜索框样式 */
	.index-search{
		display: flex;
		align-items: center;
		height: 70rpx;
		margin: 70rpx 30rpx 30rpx 30rpx;
		background-color: #f7f7f7;
		border-radius: 50rpx;
	}
	.index-search text{
		font-size: 26rpx;
		margin-right: 26rpx;
		margin-left: 28rpx;
	}
	.index-search input{
		font-size: 28rpx;
		flex:1;
	}
	
	/* 展示区样式 */
	.index-list{
		margin: 0 30rpx;
	}
	.index-list-item{
		display: flex;
		margin-bottom: 34rpx;
	}
	.index-list-img{
		width: 212rpx;
		height: 212rpx;
		position: relative;
		border-radius: 30rpx;
		overflow: hidden;
		margin-right: 22rpx;
	}
	.index-list-img image{
		width: 100%;
		height: 100%;
	}
	.index-list-img text{
		position: absolute;
		left: 12rpx;
		bottom: 16rpx;
		color: white;
		font-size: 20rpx;
	}
	.index-list-text{
		font-size: 24rpx;
		line-height: 66rpx;
	}
	.index-list-text view{
		width: 50vw;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
