// Define marker
var marker;
var map;
var arrImage = [];
var arrClip = [];
var myOptions;
var input;
var autocomplete;
var infowindow;
var oldJson;
var arrCate,arrSubCate;
$(document).ready(function() {
	$("#name").focus();
	// Call ajax to get category and subcategory
	$.ajax({
		url: '/getlistvideocate',
		type: 'POST',
		data: '',
		success: function(data){
			if(data.result){
				$('#videocate')[0].options.length = 0;
				// Draw data category
				$.each(data.result, function (i, item) {
					$('#videocate').append($('<option>', { 
						value: item._id,
						text : item.name 
					}));
				});

				// Set value for video information
				if($("#itemid").val() != ''){
					// Call ajax to get location
					var input = {"itemid" : $("#itemid").val()};
					$.ajax({
						url: '/getadmvideo',
						type: 'POST',
						data: input,
						success: function(data){
							if(data.result){
								// Draw data
								oldJson = data.result;
								$("#name").val(data.result.name);
								$("#stream").val(data.result.stream);
								$("#videocate").val(data.result.videocate);

								// Draw image
								var img = '<img width="200px" height="auto" src="'+ data.result.image +'">';
								$('#listImage').append(img);
								arrImage[0] = data.result.image;

								var clip = '<img width="200px" height="auto" src="'+ data.result.clip +'">';
								$('#listClip').append(clip);
								arrClip[0] = data.result.clip;
							}
						},
						error: function(jqXHR){
							console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
						}
					});
				} else {
					// reset location value
					$("#name").focus();
				}
			}
		},
		error : function(e){
			alert(e.responseText);
		}
	});

	// upload image review place
	$("#btnSave").click(function(e){
		if($("#listImage img").length == 0 || ("#listClip img").length == 0){
			e.preventDefault();
			return false;
		} else {
			$("#typeSubmit").val("entryInfo");
			$('#addItemForm').ajaxForm({
				beforeSubmit : function(formData, jqForm, options){
					formData.push({name:"image", value:arrImage[0]});
					formData.push({name:"clip", value:arrClip[0]});
				},
				success	: function(responseText, status, xhr, $form){
					window.location.href = '/listvideo';
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

			$("#addItemForm").ajaxForm({
				beforeSubmit:function(formData, jqForm, options){
					A.show();
					B.hide();
				}, 
				success:function(response, status, xhr, $form){
					A.hide();
					B.show();
					for(var i =0; i< response.length; i++){
						var img = '<img src="/upload/'+ response[i] +'">';
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

	//
	$('#clip').change(function() {
		if($('#clip').get(0).files.length > 0){
			$("#typeSubmit").val("uploadClip");
			var A = $("#imageloadstatus_clip");
			var B = $("#imageloadbutton_clip");

			$("#addItemForm").ajaxForm({
				beforeSubmit:function(formData, jqForm, options){
					A.show();
					B.hide();
				}, 
				success:function(response, status, xhr, $form){
					A.hide();
					B.show();
					for(var i =0; i< response.length; i++){
						var img = '<img src="/upload/'+ response[i] +'">';
						response[i] = document.location.origin + '/upload/' + response[i];
						$('#listClip').append(img);
					}
					if(response.length > 0)
						arrClip = response;
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
		window.location.href = '/listvideo';
	});
});