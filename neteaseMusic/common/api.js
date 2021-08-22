import {baseUrl} from './config.js'

// 首页
// 获取分类接口
export function topList() {
	
	// 存放每个页面的服务端接口后的id值 传到index页面
	let listIds = ['19723756' , '3779629' , '2884035' , '3778678'];
	
	// 因为需要对uni.request的返回值进行处理 处理完了就不能then回调处理了 所以返回一个new Promise
	return new Promise(function(reslove, reject) {
		
		uni.request({
			// 首页的分类接口
			url: `${baseUrl}/toplist/detail`,
			method: 'GET',
			data: {},
			success: res => {
				let result = res.data.list;
				result.length = 4;
				for(var i = 0; i<listIds.length; i++) {
					result[i].listId = listIds[i];
				}
				reslove(result);
			},
			fail: () => {},
			complete: () => {}
		});
		
	});
	
}

// 列表区
// 获取歌单列表接口
export function list(listId) {
	// uni.request本身就是一个promise函数 .then成功的返回值就是接口地址的数据
	return uni.request({
		url: `${baseUrl}/playlist/detail?id=${listId}`,
		method: 'GET',
	});
}

// 播放页
// 获取所有歌曲详情
export function songDetail(id){
	return uni.request({
		url : `${baseUrl}/song/detail?ids=${id}`,
		method : 'GET'
	})
}
// 获取音频地址
export function songUrl(id){
	return uni.request({
		url : `${baseUrl}/song/url?id=${id}`,
		method : 'GET'
	})
}
// 获取歌词
export function songLyric(id){
	return uni.request({
		url : `${baseUrl}/lyric?id=${id}`,
		method : 'GET'
	})
}
// 获取相似音乐
export function songSimi(id){
	return uni.request({
		url : `${baseUrl}/simi/song?id=${id}`,
		method : 'GET'
	})
}
// 歌曲评论
export function songComment(id){
	return uni.request({
		url : `${baseUrl}/comment/music?id=${id}`,
		method : 'GET'
	})
}

// 搜索页
// 热搜列表(详细)
export function searchHot(){
	return uni.request({
		url : `${baseUrl}/search/hot/detail`,
		method : 'GET'
	})
}
// 搜索结果
export function searchWord(word){
	return uni.request({
		url : `${baseUrl}/search?keywords=${word}`,
		method : 'GET'
	})
}
// 搜索建议
export function searchSuggest(word){
	return uni.request({
		url : `${baseUrl}/search/suggest?keywords=${word}&type=mobile`,
		method : 'GET'
	})
}