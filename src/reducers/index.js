import {combineReducers} from 'redux';
import isLoaderCountReducer from "../reducers/setting"
import settingReducer from "../reducers/setting"


const reducers = combineReducers({
  setting: settingReducer,
  isLoaderCount: isLoaderCountReducer
});

export default reducers;
