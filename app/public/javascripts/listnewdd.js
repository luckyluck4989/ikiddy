var curPage = 0;
//-------------------------------
// Initalize function
//-------------------------------
$(document).ready(function() {
	$('#pagingid  li.active').removeClass('active')
	$($('#pagingid  li')[1]).addClass('active')
	var myselect = document.getElementById("subcategory");

	$("#subcategory").change(function(){
		$.ajax({
			url: '/listnewdd',
			type: 'POST',
			data: {"page" : 1, "subcate": myselect.options[myselect.selectedIndex].value},
			success: function(data){
				$("#newddtbl tbody tr").remove();
				if(data.result[0]){
					drawData(data.result);
				}

				splitPage(data.result2);
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
	});

	$.ajax({
		url: '/listnewdd',
		type: 'POST',
		data: {"page" : 1, "subcate": myselect.options[myselect.selectedIndex].value},
		success: function(data){
			$("#newddtbl tbody tr").remove();
			if(data.result[0]){
				drawData(data.result);
			}

			splitPage(data.result2);
		},
		error: function(jqXHR){
			console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
		}
	});
});

//-------------------------------
// Draw data to table
//-------------------------------
function drawData(dataJson){
	var tmpRow = '';
	for(var i = 0; i< dataJson.length; i++){
		// create row html
		if( i%2 != 0 )
			tmpRow = '	<tr >';
		else
			tmpRow = '	<tr class="table-flag-blue">';
		tmpRow += '			<td></td>'
		tmpRow += '			<td><a href="#" class="newsid">' + dataJson[i].title + '</a></td>'
		tmpRow += '			<td>' + dataJson[i].subcategoryname + '</td>'
		tmpRow += '			<td><span class="label label-success">' + dataJson[i].like + '</span></td>'
		tmpRow += '			<td><span class="label label-warning">' + dataJson[i].add + '</span></td>'
		tmpRow += '			<td><span class="label label-success">' + dataJson[i].share + '</span></td>'
		tmpRow += '			<td id="rowID" style="display:none;">' + dataJson[i]._id + '</td>';
		tmpRow += '			<td class="visible-md visible-lg">'
		tmpRow += '				<div class="btn-group">'
		tmpRow += '					<a title="" href="#" data-original-title="Edit" class="btn btn-sm show-tooltip newsid">'
		tmpRow += '					<i class="icon-edit"></i></a>'
		tmpRow += '					<a title="" href="#" data-original-title="Delete" class="btn btn-sm btn-danger show-tooltip delnewsid">'
		tmpRow += '					<i class="icon-trash"></i></a>'
		tmpRow += '				</div>'
		tmpRow += '			</td>'
		tmpRow += '		</tr>';

		$("#newddtbl tbody").append(tmpRow);
	}

	//-------------------------------
	// Event click on each item name news
	//-------------------------------
	$(".newsid").click(function(){
		var newsid = $(this).closest('tr').find("#rowID").html();

		// Call ajax to get location
		var input = {"newsid" : newsid};
		$.ajax({
			url: '/admnews',
			type: 'POST',
			data: input,
			success: function(data){
				if(data){
					window.location.href = '/news';
				}
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
		return false;
	});

	//-------------------------------
	// Event click delete on each item name location
	//-------------------------------
	$(".delnewsid").click(function(){
		var newsid = $(this).closest('tr').find("#rowID").html();

		// Call ajax to get location
		var input = {"newsid" : newsid};
		$.ajax({
			url: '/delnews',
			type: 'POST',
			data: input,
			success: function(data){
				if(data){
					window.location.href = '/listnewdd';
				}
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
		return false;
	});
}

//-------------------------------
// Split Page
//-------------------------------
function splitPage(total){
	var idActive = $('#pagingid .active a').attr("id") == undefined ? Number("1") : Number($('#pagingid .active a').attr("id"));
	$("#pagingid li").remove();
	if(total > 0 ){
		// calculate page
		var ipage = Math.floor(total/10);
		var mod = total%10;
		if(mod > 0){
			ipage += 1;
		}

		// draw paging number
		if(ipage > 1){
			$("#pagingid").append('<li> <a href="#" id="prev"> ← </a> </li>');
			$("#pagingid").append('<li> <a href="#" id="first"> First </a> </li>');

			if(idActive - 2 > 0){
				$("#pagingid").append('<li> <a href="#" id="' + (idActive - 2) + '"> ' + (idActive - 2) + ' </a> </li>');
				$("#pagingid").append('<li> <a href="#" id="' + (idActive - 1) + '"> ' + (idActive - 1) + ' </a> </li>');
			} else if(idActive - 1 > 0){
				$("#pagingid").append('<li> <a href="#" id="' + (idActive - 1) + '"> ' + (idActive - 1) + ' </a> </li>');
			}

			$("#pagingid").append('<li> <a href="#" class="active" id="' + idActive + '"> ' + idActive + ' </a> </li>');

			if(idActive + 2 <= ipage){
				$("#pagingid").append('<li> <a href="#" id="' + (idActive + 1) + '"> ' + (idActive + 1) + ' </a> </li>');
				$("#pagingid").append('<li> <a href="#" id="' + (idActive + 2) + '"> ' + (idActive + 2) + ' </a> </li>');
			} else if(idActive + 1 <= ipage){
				$("#pagingid").append('<li> <a href="#" id="' + (idActive + 1) + '"> ' + (idActive + 1) + ' </a> </li>');
			}

			$("#pagingid").append('<li> <a href="#" id="' + ipage + '"> Last </a> </li>');
			$("#pagingid").append('<li> <a href="#" id="next"> → </a> </li>');
			$($('#pagingid  li')[idActive + 1]).addClass('active')
		}
	}

	//-------------------------------
	// Event click paging list location
	//-------------------------------
	$("#pagingid li a").click(function(){
		// Calculate page
		var idActive = Number($('#pagingid .active a').attr("id"));
		if(this.id == "prev")
			idActive -= 1;
		else if(this.id == "next")
			idActive += 1;
		else if(this.id == "next")
			idActive = 1;
		else
			idActive = Number(this.id);

		// Set active 
		$('#pagingid  li.active').removeClass('active')
		$($('#pagingid  li')[idActive + 1]).addClass('active')

		// Call ajax to get data by page
		curPage = idActive;
		var input = {"page" : idActive, "subcate": 0};
		$.ajax({
			url: '/listnewdd',
			type: 'POST',
			data: input,
			success: function(data){
				$("#newddtbl tbody tr").remove();
				if(data.result[0]){
					drawData(data.result);
				}

				splitPage(data.result2);
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
		return false;
	});
}