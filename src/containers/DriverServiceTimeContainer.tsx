import * as React from 'react';
import { connect, useSelector } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useEffect, useState } from 'react';
import { IDriverServiceTimeActionProps, IDriverServiceTimeContainerProps, IDriverServiceTimeComponentProps, IGroupedDriverServiceTime, IDriverServiceTimeModel, IDriverServiceTimeSubModel } from '../models/driverServiceTime';
import DriverServiceComponent from '../components/dashboard/DriverServiceComponent';
import { loadDriversServiceTime } from '../actions/DriverServiceTimeAction';
import { groupBy, toFixed } from '../utils/database';
import { ICollapsibleTableProps } from '../models/dashboard';
import { IDatePickerProps } from '../models/datePicker';
import { sortBy } from '../utils/driver';
import { Driver } from '../constants/enum';
import { IBarComponentProps } from '../models/graph';

const DriverServiceTimeContainer = (props: IDriverServiceTimeContainerProps & IDriverServiceTimeActionProps) => {
    const headers = [
        { columnName: 'DriverId', columnValue: 'Driver Id' },
        { columnName: 'DriverName', columnValue: 'Driver Name' },
        { columnName: 'DriverMobile', columnValue: 'Driver Mobile' },
        { columnName: 'DrivingTimeHours', columnValue: 'Driving Time Hours' },
        { columnName: 'WorkTimeHours', columnValue: 'Work Time Hours' },
        { columnName: 'RestTimeHours', columnValue: 'Rest Time Hours' },
      ];
    const groupedDataByDriverId = groupBy(props.driversServiceTime, 'DriverVehicleId') as IGroupedDriverServiceTime;
    const driverServiceTime = getWithSubModel(groupedDataByDriverId);

    const collapsibleTableProps = {
        data: driverServiceTime,
        headers,
    } as ICollapsibleTableProps;

    const datePickerFormat = 'dd/MM/yyyy';
    const dates = useSelector((store:any) => store.date) 
    const currentDateFromState = dates.currentDate
    const initialToDateFromState = dates.initialToDate;
    const minDate = new Date();
    const currentDate = new Date();
    minDate.setMonth(currentDate.getMonth() - 3);
    const [fromDate, setFromDate] = useState<Date | null>(initialToDateFromState);
    const [toDate, setToDate] = useState<Date | null>(currentDateFromState);
    const handleDateChange = (fromDate: Date | null, toDate: Date | null) => {
        if (toDate && fromDate) {
            setToDate(toDate);
            setFromDate(fromDate);
            props.loadDriversServiceTime(fromDate, toDate);
        }
    };

    const datePickerProps = {
        datePickerDateFormat: datePickerFormat,
        datePickerMinDate: minDate,
        datePickerMaxDate: currentDate,
        datePickerFromDate: fromDate ? fromDate : initialToDateFromState,
        datePickerToDate: toDate ? toDate : currentDateFromState,
        handleDateChange: (fromDate: Date, toDate: Date) => handleDateChange(fromDate, toDate)
    } as IDatePickerProps;

    const mostDrivingTime = {
        title: 'Top Driving Time',
        xaxisTitle: 'Driver Name',
        yaxisTitle: 'Driving Time',
        plot: sortBy(driverServiceTime, Driver.DrivingTime, 'desc'),
        barColor: '#1f77b4'
    } as IBarComponentProps;

    const leastDrivingTime = {
        title: 'Least Driving Time',
        xaxisTitle: 'Driver Name',
        yaxisTitle: 'Driving Time',
        plot: sortBy(driverServiceTime, Driver.DrivingTime),
        barColor: '#1f77b4'
    } as IBarComponentProps;

    const driverServiceTimeComponentProps = {
        mostDrivingDrivers: mostDrivingTime,
        leastDrivingDrivers: leastDrivingTime,
        tableData: collapsibleTableProps,
        datePicker: datePickerProps
    } as IDriverServiceTimeComponentProps;

    useEffect(
        () => {
            if (fromDate && toDate) {
                props.loadDriversServiceTime(fromDate, toDate);
            }
        },
        [props.loadDriversServiceTime]);

    return (
        <DriverServiceComponent {...driverServiceTimeComponentProps} />
    );
};

export const getWithSubModel = (groupedData: IGroupedDriverServiceTime): IDriverServiceTimeModel[] => {
    let driverServiceTime = [] as IDriverServiceTimeModel[];

    for (let key in groupedData) {
        if (key) {
            const {
                DCS_DriverMaster: { DriverId, DriverMobile, DriverName },
                CreatedDate,
                DCS_VehicleMaster: { VehicleLicenseNo, VehicleName }
            } = groupedData[key][0];
            const driverServiceTimeModel = {
                DriverId,
                CreatedDate,
                DriverMobile,
                DriverName,
                VehicleLicenseNo,
                VehicleName,
                DrivingTimeHours: 0,
                WorkTimeHours: 0,
                RestTimeHours: 0,
                SubModel: [] as IDriverServiceTimeSubModel[]
            } as IDriverServiceTimeModel;

            groupedData[key].map((c, index) => {
                driverServiceTimeModel.RestTimeHours += c.RestTimeHours;
                driverServiceTimeModel.DrivingTimeHours += c.DrivingTimeHours;
                driverServiceTimeModel.WorkTimeHours += c.WorkTimeHours;
                driverServiceTimeModel.SubModel[index] = {
                    RestingStartTime: '',
                    RestingEndTime: '',
                    VehicleStartTime: '',
                    VehicleEndTime: ''
                } as IDriverServiceTimeSubModel;
                driverServiceTimeModel.SubModel[index].RestingStartTime = c.RestingStartTime;
                driverServiceTimeModel.SubModel[index].RestingEndTime = c.RestingEndTime;
                driverServiceTimeModel.SubModel[index].VehicleStartTime = c.VehicleStartTime;
                driverServiceTimeModel.SubModel[index].VehicleEndTime = c.VehicleEndTime;

                return c;
            });

            driverServiceTimeModel.RestTimeHours = toFixed(driverServiceTimeModel.RestTimeHours);
            driverServiceTimeModel.DrivingTimeHours = toFixed(driverServiceTimeModel.DrivingTimeHours);
            driverServiceTime.push(driverServiceTimeModel);
        }
    }
    return driverServiceTime;
};

const mapStateToProps = ({ driversServiceTime }: { driversServiceTime: IDriverServiceTimeContainerProps }) => {
    return {
        driversServiceTime: driversServiceTime.driversServiceTime
    };
};

const mapDispatchToProps = (dispatch: any) =>
    bindActionCreators(
        {
            loadDriversServiceTime: (fromDate: Date, toDate: Date) => loadDriversServiceTime(fromDate, toDate)
        },
        dispatch
    );

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DriverServiceTimeContainer);
