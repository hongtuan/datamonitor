!function(){
  var timeRangeSelector = {};
  var fmt = 'MM/DD/YYYY h:mm a';

  var timeRangeCtrl;
  var startHour = 6,startMinute = 0;
  var endHour = 17,endMinute = 30;
  var endWithCurTime = true;
  var rangeType = 'RT1';

  var selectedRange = null;

  var start = moment().hour(startHour).minute(startMinute);
  var end = moment().hour(endHour).minute(endMinute);

  function getZoneOffet(){
    //var d = new Date();
    //var tzo = d.getTimezoneOffset();
    var sign = '+',oh='00',om='00';
    if(clientTimezoneOffset>0) sign = '-';
    oh = Math.abs(clientTimezoneOffset)/60;
    if(oh<9) oh = '0'+oh;
    om = Math.abs(clientTimezoneOffset)%60;
    if(om<30) om = '0'+om;
    return `${sign}${oh}:${om}`;
  }

  function setStartEnd(){
    start = moment().hour(startHour).minute(startMinute);
    //end = moment().hour(endHour).minute(endMinute);
    end = endWithCurTime?moment():moment().hour(endHour).minute(endMinute);
  }

  function isTimeRangeOk(picker){
    return moment(picker.endDate).diff(moment(picker.startDate),'minutes') > 60;
  }

  function buildRanges(){
    //end = moment();
    setStartEnd();
    switch(rangeType){
      case 'RT1':
      return {
        'Today': [start, end],
        'Yesterday': [moment().subtract(1, 'days').hour(startHour).minute(startMinute), moment().subtract(1, 'days').hour(endHour).minute(endMinute)],
        'Last 3 Days': [moment().subtract(2, 'days').hour(startHour).minute(startMinute), end],
        'Last 7 Days': [moment().subtract(6, 'days').hour(startHour).minute(startMinute), end],
        'Last 15 Days': [moment().subtract(14, 'days').hour(startHour).minute(startMinute), end],
        'Last 30 Days': [moment().subtract(29, 'days').hour(startHour).minute(startMinute), end],
        'This Month': [moment().startOf('month').hour(startHour).minute(startMinute), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month').hour(startHour).minute(startMinute), moment().subtract(1, 'month').endOf('month')]
      };
      case 'RT2':
      return {
        'Last 2 Days': [moment().subtract(1, 'days').hour(startHour).minute(startMinute), end],
        'Last 3 Days': [moment().subtract(2, 'days').hour(startHour).minute(startMinute), end],
        'Last 5 Days': [moment().subtract(4, 'days').hour(startHour).minute(startMinute), end],
        'Last 10 Days': [moment().subtract(9, 'days').hour(startHour).minute(startMinute), end],
        'Last 15 Days': [moment().subtract(14, 'days').hour(startHour).minute(startMinute), end],
        'Last 20 Days': [moment().subtract(19, 'days').hour(startHour).minute(startMinute), end],
        'Last 25 Days': [moment().subtract(24, 'days').hour(startHour).minute(startMinute), end],
        'Last 30 Days': [moment().subtract(29, 'days').hour(startHour).minute(startMinute), end],
        'This Month': [moment().startOf('month').hour(startHour).minute(startMinute), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month').hour(startHour).minute(startMinute), moment().subtract(1, 'month').endOf('month')]
      };
    }
  }

  timeRangeSelector.config = function(opt){
    //console.log('do config here.');
    if(opt.endWithCurTime == 'no') endWithCurTime = false;

    if(opt.hasOwnProperty('startHour')) startHour = opt.startHour;
    if(opt.hasOwnProperty('startMinute')) startMinute = opt.startMinute;

    if(opt.hasOwnProperty('endHour')) endHour = opt.endHour;
    if(opt.hasOwnProperty('endMinute')) endMinute = opt.endMinute;

    if(opt.hasOwnProperty('rangeType')) rangeType = opt.rangeType;
    //console.log('endWithCurTime:',endWithCurTime,'startHour:',startHour,'endHour',endHour);
    return this;
  };

  timeRangeSelector.getDefaultRange = function(){
    //console.log('getDefaultRange');
    setStartEnd();
    return {
      from:start.toISOString(),
      to:end.toISOString(),
      ctzo:new Date().getTimezoneOffset()};
  };

  timeRangeSelector.show = function(timeRangeTextID,cb,fail) {
    timeRangeCtrl = $("#"+timeRangeTextID);
    //config the daterangepicker here.
    timeRangeCtrl.daterangepicker({
      startDate: start,
      endDate: end,
      minDate: moment().subtract(180, 'days').toDate(),
      maxDate: moment().toDate(),
      timePicker: true,
      timePickerIncrement: 30,
      ranges: buildRanges(),
      autoUpdateInput:false,
      locale: {
        format: fmt
      }
    }, function(start, end, label) {
      //endWithCurTime = label == 'Today';
      endWithCurTime = !(label.endsWith('Days')||label=='Yesterday');
      var text = `${start.format(fmt)} - ${endWithCurTime?end.format(fmt):end.hour(endHour).minute(endMinute).format(fmt)}`;
      timeRangeCtrl.val(text);
    });//echoTimeRange

    //daterangepicker event.
    timeRangeCtrl.on('show.daterangepicker', (ev, picker)=>{
      //console.log('show.daterangepicker');
      //*
      if(moment().diff(end,'minutes') >=1){
        //console.log('need update range.');
        picker.ranges = buildRanges();
        //console.log('update range over.');
      }//*/
    });

    timeRangeCtrl.on('apply.daterangepicker', (ev, picker)=>{
      if(isTimeRangeOk(picker)){
        //console.log('endWithCurTime:',endWithCurTime);
        //console.log('picker.startDate:',JSON.stringify(picker.startDate,null,2));
        //console.log('picker.endDate:',JSON.stringify(picker.endDate,null,2));
        if(!endWithCurTime){
          picker.endDate = picker.endDate.hour(endHour).minute(endMinute);
        }
        //console.log('after set,picker.endDate:',JSON.stringify(picker.endDate,null,2));
        selectedRange = {
          from:picker.startDate.toISOString(),
          to:picker.endDate.toISOString(),
          //ctzo:new Date().getTimezoneOffset()
          ctzo:moment().zone()
        };

        //console.log('selectedRange:',JSON.stringify(selectedRange,null,2));
        if(cb) cb(selectedRange);
      }else{
        console.log('timeRange invalid.');
        if(fail) fail();
        //parent.layer.msg('timeRange invalid.');
      }
    });
    //default show Today.
    timeRangeCtrl.val(`${start.format(fmt)} - ${end.format(fmt)}`);
  };

  this.timeRangeSelector = timeRangeSelector;
}();
