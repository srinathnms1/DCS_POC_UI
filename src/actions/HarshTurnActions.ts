import { API, UPDATE_HARSHTURN } from '../constants/Actions';
import { Http } from '../constants/enum';
import * as DateFns from 'date-fns';

export const loadHarshTurn = (fromDate: Date, toDate: Date) => {
    const dateFormat = 'yyyy-MM-d hh:mm:ss';
    const formattedFromDate = DateFns.format(fromDate, dateFormat);
    const formattedToDate = DateFns.format(toDate, dateFormat);
    const driverInsightsUrl = `/drivinginsights?from=${formattedFromDate}&to=${formattedToDate}`;

    return (dispatch: any) => {
        dispatch({
            type: API,
            payload: {
                url: driverInsightsUrl,
                method: Http.Get,
                onSuccess: (response: any) => {
                    dispatch({
                        type: UPDATE_HARSHTURN,
                        payload: { harshTurn: response }
                    });
                }
            }
        });
    };
};