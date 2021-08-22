<template>
	<view class="search">
		<musichead title="搜索" :icon="true" :iconblack="true"></musichead>
		
		<view class="container">
			<scroll-view scroll-y="true">
				
				<!-- 搜索框 -->
				<view class="search-search">
					<text class="iconfont icon-fangdajing"></text>
					<input type="text" placeholder="搜索歌曲" v-model="searchWord" 
					@confirm="handleToSearch(searchWord)"  @input="handleToTips"/>
					<text v-show="searchType != 1" class="iconfont icon-guanbi" 
					@tap="hanleToClose"></text>
				</view>
				
				
				<!-- 搜索首页 -->
				<block v-if="searchType == 1">
					<!-- 历史记录 -->
					<view class="search-history">
						<view class="search-history-head">
							<text>历史记录</text>
							<text class="iconfont icon-icon--" @tap="handleToClear"></text>
						</view>
						<view class="search-history-list">
							<view v-for="(item, index) in searchHistory" :key="index" @tap="handleToWord(item)">{{item}}</view>
						</view>
					</view>
					
					<!-- 热搜榜 -->
					<view class="search-hot">
						<view class="search-hot-head">
							热搜榜
						</view>
						
						<view class="search-hot-item" v-for="(item, index) in searchHot" :key="index" @tap="handleToWord(item.searchWord)">
							<view class="search-hot-top">{{index+1}}</view>
							<view class="search-hot-word">
								<view>
									{{item.searchWord}}<image :src="item.iconUrl" mode="aspectFit"></image>
								</view>
								<view>{{item.content}}</view>
							</view>
							<text class="search-hot-count">{{item.score}}</text>
						</view>
						
					</view>
				</block>
				
				<!-- 搜索结果页 -->
				<block v-else-if="searchType == 2">
					<view class="search-result">
						
						<view class="search-result-item" v-for="(item, index) in searchList" :key="index" @tap="handleToDetail(item.id)">
							<view class="search-result-word">
								<view>{{item.name}}</view>
								<view>{{item.artists[0].name}} - {{item.album.name}}</view>
							</view>
							<text class="iconfont icon-bofang1"></text>
						</view>
						
					</view>
				</block>
				
				<!-- 搜索下拉提示功能页 -->
				<block v-else-if="searchType == 3">
					<view class="search-suggest">
						<view class="search-suggest-head">
							搜索"{{searchWord}}"
						</view>
						
						<view class="search-suggest-item" v-for="(item, index) in searchSuggest" :key="index"
						@tap="handleToWord(item.keyword)">
							<text class="iconfont icon-fangdajing"></text>
							{{item.keyword}}
						</view>
						
					</view>
				</block>
				
			</scroll-view>
		</view>
	</view>
</template>

<script>
	import '@/common/iconfont.css'
	import musichead from '../../components/musichead/musichead.vue'
	import {searchHot, searchWord, searchSuggest} from '../../common/api.js'
	
	export default {
		data() {
			return {
				searchHot: [],
				searchWord: '',
				searchHistory: [],
				searchType: 1,
				searchList: [],
				searchSuggest: [],
			}
		},
		onLoad() {
			// 接收热搜榜数据
			searchHot().then(res => {
				if(res[1].data.code = '200') {
					this.searchHot = res[1].data.data;
				}
			});
			
			// 页面加载时取出本地存储的数据
			uni.getStorage({
				key: 'searchHistory',
				success: (res) => {
				    this.searchHistory = res.data;
				}
			});
		},
		components:{musichead},
		methods: {
			// 点击热搜榜时 对应关键词返回到搜索框中 并跳转到搜索详情页
			handleToWord(word) {
				this.searchWord = word;
				this.handleToSearch(word);
			},
			
			// 按回车搜索歌曲 
			handleToSearch(word) {
				// 将歌曲添加到历史记录
				this.searchHistory.unshift(word);
				this.searchHistory = [...new Set(this.searchHistory)];
				if(this.searchHistory.length > 10) {
					this.searchHistory.length = 10;
				}
				uni.setStorage({
					key: 'searchHistory',
					data: this.searchHistory
				})

				// 获取搜索数据 跳转页面到搜素内容页
				this.getSearchList(word);
			},
			
			// 删除历史记录 并将searchHistory设为空 重新渲染页面
			handleToClear() {
				uni.removeStorage({
					key: 'searchHistory',	
					success: (res) => {
						this.searchHistory = [];
					}
				});
			},
			
			// 获取搜索数据 跳转页面到搜素内容页
			getSearchList(word){
				searchWord(word).then( (res) => {
					if(res[1].data.code = '200') {
						this.searchList = res[1].data.result.songs;
						this.searchType = 2;
					}
				});
			},
			
			// 点击搜索框后的删除 搜索框清空 返回搜索主页
			hanleToClose() {
				this.searchWord = '';
				this.searchType = 1;
			},
			
			// 点击搜索内容 跳转歌曲详情页	
			handleToDetail(songId) {
				console.log(1);
				uni.navigateTo({
					url: '/pages/detail/detail?songId=' + songId,
				});
			},
			
			// 搜索时出现下面提示选项
			handleToTips(e) {
				let value = e.detail.value;  // 等于 e.target.value
				if(!value) {
					this.searchType = 1;
					return;
				}
				searchSuggest(value).then( res => {
					if(res[1].data.code = '200') {
						this.searchSuggest = res[1].data.result.allMatch;
						this.searchType = 3;
					}
				})
			}
		}
	}
</script>

<style scoped>
	.search-search{
		display: flex;
		align-items: center;
		height: 70rpx;
		margin: 70rpx 30rpx 50rpx 30rpx;
		background-color: #f7f7f7;
		border-radius: 50rpx;
	}
	.search-search text{
		margin: 0 26rpx;
	}
	.search-search input{
		flex: 1;
		font-size: 26rpx;
	}
	
	.search-history{
		margin: 0 30rpx 50rpx 30rpx;
		font-size: 26rpx;
	}
	.search-history-head{
		display: flex;
		justify-content: space-between;
		margin-bottom: 36rpx;
	}
	.search-history-list{
		display: flex;
		flex-wrap: wrap;
	}
	.search-history-list view{
		padding: 16rpx 28rpx;
		border-radius: 40rpx;
		margin-right: 30rpx;
		margin-bottom: 30rpx;
		background-color: #f7f7f7;
	}
	
	.search-hot{
		margin: 0 30rpx;
		font-size: 26rpx;
	}
	.search-hot-head{
		margin-bottom: 36rpx;
	}
	.search-hot-item{
		display: flex;
		align-items: center;
		margin-bottom: 58rpx;
	}
	.search-hot-top{
		color: #fb2222;
		width: 60rpx;
		margin-left: 8rpx;
	}
	.search-hot-word{
		flex: 1;
	}
	.search-hot-word image{
		width: 48rpx;
		height: 22rpx;
	}
	.search-hot-word view:nth-child(1){
		font-size: 30rpx;
		color: #000000;
	}
	.search-hot-word view:nth-child(2){
		font-size: 24rpx;
		color: #878787;
		width: 500rpx;
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}
	.search-hot-count{
		color: #878787;
	}
	
	.search-result{
		border-top: 2rpx solid #e4e4e4;
		padding: 30rpx;
	}
	.search-result-item{
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 30rpx;
		margin-bottom: 30rpx;
		border-bottom: 2rpx solid #e4e4e4;
	}
	.search-result-word{}
	.search-result-word view:nth-child(1){
		font-size: 28rpx;
		color: #235790;
		margin-bottom: 12rpx;
	}
	.search-result-word view:nth-child(2){
		font-size: 22rpx;
		color: #898989;
	}
	.search-result-word text{
		font-size: 50rpx;
	}
	
	.search-suggest{
		border-top: 2rpx solid #e4e4e4;
		padding: 30rpx;
		font-size: 26rpx;
	}
	.search-suggest-head{
		color: #4574a5;
		margin-bottom: 74rpx;
	}
	.search-suggest-item{
		color: #5d5d5d;
		margin-bottom: 74rpx;
	}
	.search-suggest-item text{
		color: #bdbdbd;
		margin-right: 28rpx;
		position: relative;
		top: 2rpx;
	}
</style>
