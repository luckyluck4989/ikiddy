// Define marker
var marker;
var map;
var arrImage = [];
var myOptions;
var input;
var autocomplete;
var infowindow;
var oldJson;
var arrCate,arrSubCate;
$(document).ready(function() {
	$("#code").focus();

	// Call ajax to get category and subcategory
	if($("#foodsubcateid").val() != ''){
		// Call ajax to get location
		var input = {"foodsubcateid" : $("#foodsubcateid").val()};
		$.ajax({
			url: '/getadmfoodsubcate',
			type: 'POST',
			data: input,
			success: function(data){
				if(data.result){
					// Draw data
					oldJson = data.result;
					$("#code").val(data.result.code);
					$("#foodcate").val(data.result.foodcate);
					$("#name").val(data.result.name);

					// Draw image
					var img = '<img width="300px" height="200px" src="'+ data.result.image +'">';
					$('#listImage').append(img);
					arrImage[0] = data.result.image;
				}
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
	} else {
		// reset location value
		$("#code").focus();
		$("#name").val('');
	}

	// upload image review place
	$("#btnSave").click(function(e){
		if($("#listImage img").length == 0){
			e.preventDefault();
			return false;
		} else {
			$("#typeSubmit").val("entryInfo");
			$('#addNewsForm').ajaxForm({
				beforeSubmit : function(formData, jqForm, options){
					formData.push({name:"image", value:arrImage[0]});
				},
				success	: function(responseText, status, xhr, $form){
					window.location.href = '/listfoodsubcate';
				},
				error : function(e){
					alert(e.responseText);
				}
			});
		}
	});

	//
	$('#photoimg').change(function() {
		if($('#photoimg').get(0).files.length > 0){
			$("#typeSubmit").val("uploadImage");
			var A = $("#imageloadstatus");
			var B = $("#imageloadbutton");

			$("#addNewsForm").ajaxForm({
				beforeSubmit:function(formData, jqForm, options){
					A.show();
					B.hide();
				}, 
				success:function(response, status, xhr, $form){
					A.hide();
					B.show();
					for(var i =0; i< response.length; i++){
						var img = '<img width="300px" height="200px" src="/upload/'+ response[i] +'">';
						response[i] = document.location.origin + '/upload/' + response[i];
						$('#listImage').append(img);
					}
					if(response.length > 0)
						arrImage = response;
				}, 
				error:function(e){
					A.hide();
					B.show();
					alert(e.responseText);
				}
			}).submit();
		}
	});

	// Cancel button click
	$("#btnCancel").click(function(e){
		window.location.href = '/listfoodsubcate';
	});
});

function filerCategory(cateid){
	$('#subcategory')[0].options.length = 0;
	// Draw data subcategory
	$.each(arrSubCate, function (i, item) {
		if(item.categoryid == cateid)
		{
			$('#subcategory').append($('<option>', { 
				value: item.subcategoryid,
				text : item.subcategoryname 
			}));
		}
	});
}