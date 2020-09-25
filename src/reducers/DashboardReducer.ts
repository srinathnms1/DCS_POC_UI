import { IDashboardContainerProps } from '../models/dashboard';
import { UPDATE_DASHBOARD } from '../constants/Actions';

const initialState = {
    dashboard: []
} as IDashboardContainerProps;

const DashboardReducer = (state = initialState, action: any) => {
    switch (action.type) {
        case UPDATE_DASHBOARD:            
            return {
                ...state,
                ...action.payload
            };
        default:
            return state;
    }
};

export default DashboardReducer;
