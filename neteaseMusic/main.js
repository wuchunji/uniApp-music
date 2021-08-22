import App from './App'
import Vue from 'vue'
import store from 'store/index.js'

Vue.config.productionTip = false;

App.mpType = 'app'; // 不知道干嘛用的 好像跟ts有关系

// 添加一个过滤器 处理大数字
Vue.filter('formatCount', function(value) {
	if(value >= 10000 && value <= 100000000) {
		value /= 10000;
		return value.toFixed(1) + '万';
	}
	else if(value >= 100000000){
		value /= 100000000;
		return value.toFixed(1) + '亿';
	}
	else{
		return value;
	}
})

Vue.filter('formatTime', function(value) {
	var date = new Date(value);
	return date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日';
})

const app = new Vue({
	...App,  		// 等于render: h => h(App),
	store,
})
app.$mount()
