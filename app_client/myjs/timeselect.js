!function(){
  var timeRangeSelector = {};
  var fmt = 'MM/DD/YYYY h:mm a';
  
  var timeRangeCtrl;
  var startHour = 5,startMinute = 30;
  var endHour = 22,endMinute = 0;  
  var endWithCurTime = true;
  
  var start = moment().hour(startHour).minute(startMinute);
  var end = moment();
  
  function setStartEnd(){
    start = moment().hour(startHour).minute(startMinute);
    end = moment();
    if(!endWithCurTime) {
      end = moment().hour(endHour).minute(endMinute);
    }
  }
  
  function echoTimeRange() {
    setStartEnd();
    timeRangeCtrl.val(start.format(fmt) + ' - ' + end.format(fmt));
  }
  
  function isTimeRangeOk(picker){
    return moment(picker.endDate).diff(moment(picker.startDate),'minutes') > 60;
  }
  
  function buildRanges(){
    //end = moment();
    setStartEnd();    
    return {
      'Today': [start, end],
      'Yesterday': [moment().subtract(1, 'days').hour(startHour).minute(startMinute), end],
      'Last 3 Days': [moment().subtract(2, 'days').hour(startHour).minute(startMinute), end],
      'Last 7 Days': [moment().subtract(6, 'days').hour(startHour).minute(startMinute), end],
      'Last 15 Days': [moment().subtract(14, 'days').hour(startHour).minute(startMinute), end],
      'Last 30 Days': [moment().subtract(29, 'days').hour(startHour).minute(startMinute), end],
      'This Month': [moment().startOf('month').hour(startHour).minute(startMinute), moment().endOf('month')],
      'Last Month': [moment().subtract(1, 'month').startOf('month').hour(startHour).minute(startMinute), moment().subtract(1, 'month').endOf('month')]
    };
  }
  
  timeRangeSelector.config = function(opt){
    console.log('do config here.');
    if(opt.endWithCurTime=='no') endWithCurTime = false;
    
    if(opt.startHour) startHour = opt.startHour;
    if(opt.startMinute) startMinute = opt.startMinute;
    
    if(opt.endHour) endHour = opt.endHour;
    if(opt.endMinute) endMinute = opt.endMinute;
    console.log('endWithCurTime:',endWithCurTime,'startHour:',startHour);
    return this;
  };
  
  timeRangeSelector.getDefaultRange = function(){
    //console.log('getDefaultRange');
    setStartEnd();
    return {from:start.toISOString(),to:end.toISOString()};
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
      locale: {
        format: fmt
      }
    }, echoTimeRange);

    //daterangepicker event.
    timeRangeCtrl.on('show.daterangepicker', (ev, picker)=>{
      //console.log('show.daterangepicker');
      if(moment().diff(end,'minutes') >=1){
        console.log('need update range.');
        picker.ranges = buildRanges();
        console.log('update range over.');
      }
    });

    timeRangeCtrl.on('apply.daterangepicker', (ev, picker)=>{
      if(isTimeRangeOk(picker)){
        var dataTimeRange = {
          from:picker.startDate.toISOString(),
          to:picker.endDate.toISOString()
        };
        if(cb) cb(dataTimeRange);
      }else{
        console.log('timeRange invalid.');
        if(fail) fail();
        //parent.layer.msg('timeRange invalid.');
      }
    });
  };
  
  this.timeRangeSelector = timeRangeSelector;
}();
