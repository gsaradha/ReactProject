import axios from 'axios';
const instance=axios.create({
    baseURL:'https://burgerbuilder-58abe-default-rtdb.firebaseio.com/'
});

export default instance;