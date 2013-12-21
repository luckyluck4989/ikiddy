// Define marker
var marker;
var map;
var arrImage = [];
var myOptions;
var input;
var autocomplete;
var infowindow;
var oldJson;
$(document).ready(function() {
	$("#title").focus();

	// Call ajax to get category and subcategory
	$.ajax({
		url: '/getlistcc',
		type: 'POST',
		data: '',
		success: function(data){
			if(data.result){
				$('#category')[0].options.length = 0;
				// Draw data category
				$.each(data.result, function (i, item) {
					$('#category').append($('<option>', { 
						value: item.categoryid,
						text : item.categoryname 
					}));
				});

				$('#subcategory')[0].options.length = 0;
				// Draw data subcategory
				$.each(data.resultsub, function (i, item) {
					$('#subcategory').append($('<option>', { 
						value: item.subcategoryid,
						text : item.subcategoryname 
					}));
				});

				if($("#newsid").val() != ''){
					// Call ajax to get location
					var input = {"newsid" : $("#newsid").val()};
					$.ajax({
						url: '/getadmlocation',
						type: 'POST',
						data: input,
						success: function(data){
							if(data.result){
								// Draw data
								oldJson = data.result;
								$("#namelocation").val(data.result.namelocation);
								$("#country").val(data.result.country);
								$("#city").val(data.result.city);
								$("#description").val(data.result.description);
								$("#searchTextField").val(data.result.address);
								if(data.result.isrecommend == 'true' )
									$("#isrecommend").attr('checked',true);
								else
									$("#isrecommend").attr('checked',false);

								// Draw image
								for(var i =0; i< data.result.imagelist.length; i++){
									var img = '<img width="200px" height="auto" src="'+ data.result.imagelist[i] +'">';
									$('#listImage').append(img);
								}
								if(data.result.imagelist.length > 0)
									arrImage = data.result.imagelist;

								map.setCenter(new google.maps.LatLng(data.result.coordinate[0], data.result.coordinate[1]));
								map.setZoom(17);	// Why 17? Because it looks good.

								marker = new google.maps.Marker({
									map: map,
									position: new google.maps.LatLng(data.result.coordinate[0], data.result.coordinate[1])
								});

							}
						},
						error: function(jqXHR){
							console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
						}
					});
				} else {
					// reset location value
					$("#title").focus();
					$("#title").val('');
					$("#content").val('');
				}
			}
		},
		error : function(e){
			alert(e.responseText);
		}
	});

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
					formData.push({name:"categoryname", value:$("#category option:selected").text()});
					formData.push({name:"subcategoryname", value:$("#subcategory option:selected").text()});
				},
				success	: function(responseText, status, xhr, $form){
					window.location.href = '/listlocation';
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

	// Cancel button click
	$("#btnCancel").click(function(e){
		window.location.href = '/listlocation';
	});
});