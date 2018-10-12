program={
    list:[],
    time:new moment(), //minutes
    title:'',
    timeinterval:0,
    start_time:new moment(),
    start_countdown_time:null, 
    start_countdown:function(){
        program.start_countdown_time=new moment($('#start_time').val(),'HH:mm');
        program.timeinterval=setInterval(
	    function(){
            if($('#pretime').length==0){
                $('<div>')
                .css({
                    'display':'none',
                    'width': '500px'
                })
                .attr('id','pretime')
                .append(
                    $('<p>')
                        .css({
                            'font-size': '40px'
                        })
                        .html('Starting at: '+program.start_countdown_time.format('hh:mm A'))
                    )
                    .append(
                        $('<p>')
                        .css({
                            'font-size': '40px'
                        })
                        .attr('id','current_hour')
                        .html('Current Hour: '+String(moment().format('hh:mm:ss A')))
                    )
                    .dialog({
                        modal: true,
                        width: '550px',
                        close: function() {
                            $('#pretime').remove();
                        }
                    });
            }else if($('#pretime').length==1){
                $('#current_hour').html('Current Hour: '+String(moment().format('hh:mm:ss A')));
            }
            if(program.start_countdown_time.unix()<=moment().unix()){
                $('#pretime').dialog('close');
                var data=$('#conteiner > .program:first-child').data('data');
                if(typeof data == 'string'){
                    data=JSON.parse(data);
                }
                if(typeof data.unix == 'undefined'){
                    data.unix= new moment();
                    data.unix.add(data.time, 'minutes');
                }else{
                    data.unix= new moment.unix(data.unix);
                }
                program.start_time = new moment();
                var duration = moment.duration(data.unix.diff(program.start_time));
                $("#conteiner>.program:first-child>.program-time").html(Math.abs(duration._data.hours)+':'+Math.abs(duration._data.minutes)+':'+Math.abs(duration._data.seconds));
                if(duration._data.minutes<=1 ){
                    $('#conteiner > .program:first-child').effect( 'highlight', {}, 500);
                }
                if(duration._data.hours==0 && duration._data.minutes<=0 && duration._data.seconds<=0){
                    $("#conteiner>.program:first-child").remove();
                    if ($('.program').length==0) {
                        clearInterval(program.timeinterval);
                    }
                }else{
                    data.unix=data.unix.unix();
                    $('#conteiner > .program:first-child').data('data',JSON.stringify(data));
                }   
            }
	    },
		1000
	    );    
    },
    render_list:function(){
		$('#conteiner')
        .css({
            'padding': '0px',
            'margin': '0px'
        });
        program.list.forEach(function(title){
            program.render_title(title);
        });
    },
    render_title:function(title,before='#new-program'){
        $('<li>')
        .insertBefore( $( before ) )
        .attr('id','program-'+$('.program').length)
        .data('data',JSON.stringify(title))
        .addClass('program')
        .addClass('ui-state-defaul')
        .append(
            $('<button>')
            .css({
				'float': 'left',
                'opacity': '0.5'
			})
			.attr('data-index', $('.program').length)
            .addClass('remove-button')
            .html('X')
            .click(function(){
                $(this).parent().remove();
            })
        )
		.append(
            $('<p>')
			.addClass('program-title')
			.css({
				'float': 'left',
            })
            .html(title.title)
        )
        .append(
            $('<p>')
			.addClass('program-time')
            .attr('id','program-time-'+$('.program').length)
			.css({
				'float': 'right'
			})
            .html(title.time+" Min")
        )
        .hover(
            function() {
                var data=JSON.parse($(this).data('data'));
                data.id=$(this).attr('id');
                $(this)
                .append(
                    $("<button>")
                    .attr('data-data',JSON.stringify(data))
                    .addClass('edit')
                    .html('Edit')
                    .button()
                    .click(function(){
                        var data=$(this).data('data');
                        $('<div>')
                        .css({
                            'display':'none',
                            'width': '500px'
                        })
                        .attr('id','editwindow')
                        .append(
                            $('<input>')
                            .attr('id','new_title')
                            .val(data.title)    
                        )
                        .append(
                            $('<input>')
                            .attr('type','hidden')
                            .attr('id','program_edit')
                        .val(data.id)    
                        )
                        .append(
                            $('<input>')
                            .attr('id','new_time')
                            .val(data.time)
                        )
                        .dialog({
                            modal: true,
                            width: 'auto',
                            close: function() {
                                $('#editwindow').remove();
                            },
                            buttons: {
                                "Submit": function() {
                                    var program_edit=$('#program_edit').val();
                                    $('#'+program_edit).find('.program-title').html($('#new_title').val());
                                    $('#'+program_edit).find('.program-time').html($('#new_time').val()+' Min');
                                    var js={};
                                    js.title=$('#new_title').val();
                                    js.time=$('#new_time').val();
                                    $('#'+$('#program_edit').val()).data('data',JSON.stringify(js));
                                    program.total_show_time();
                                    $(this).dialog( "close" );
                                },
                                Cancel: function() {
                                    $(this).dialog( "close" );
                                }
                            }
                        });
                    })
                );
            },
            function() {
                $(this).find("button:last").remove();
            }
        )
        .draggable({
            connectToSortable: "#conteiner",
            revert: "invalid",
            axis: "y",
            stop: function( event, ui ) {
                $(ui.helper[0]).css({
                    'height':'',
                    'width':''
                });
            }
        });
        $( "ul, li" ).disableSelection();
        $( "#conteiner" ).sortable({
            revert: true
        });
    },
    total_show_time : function (){
        var total=0;
        $('.program').each(function(){
            var data=$(this).data('data');
            total+=parseFloat(data.time);
        });
        //$('#total-show-time').html('Total Show Time: '+total+' Min');
    }
};
$('#add-program-button').click(function(){
    var title={
        title:$('#new-title').val(),
        time:$('#new-time').val()
    };
    program.list.push(title);
    program.render_title(title);
});
$('#start_button').click(function(){
	$('#form').hide();
	$('body').css({'background-color': '#00ff00'});
    program.start_countdown();
});
$( document ).on( "mouseover", ".program:last", function() {
    $('#new-program').show();
});
$( document ).on( "mouseover", "#new-program", function() {
    $('#new-program').show();
});
$( document ).on( "mouseout", "#new-program", function() {
    $('#new-program').hide();
});

//####### Def Program List #######

program.list.push({
    title:'Prelude Music',
    time:25
});
program.list.push({
    title:'Opening Prayer',
    time:2
});
program.list.push({
    title:'Praise/Worship',
    time:1
});
program.list.push({
    title:'Prayer line ',
    time:5
});
program.list.push({
    title:'Breakfast Word',
    time:3
});
program.list.push({
    title:'SOJH News',
    time:7
});
program.list.push({
    title:'Special number',
    time:7
});
program.list.push({
    title:'Word',
    time:24
});
program.list.push({
    title:'Offering/Pray over offering',
    time:5
});
program.list.push({
    title:'Welcome first-timers',
    time:2
});
program.list.push({
    title:'Benediction',
    time:1
});
program.list.push({
    title:'Instrumentals',
    time:10
});
program.render_list();
