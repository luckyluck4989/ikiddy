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
var currentSubCate;
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
				arrCate = data.result;
				currentSubCate = data.subcate;

				$('#subcategory')[0].options.length = 0;
				// Draw data subcategory
				/*
				$.each(data.resultsub, function (i, item) {
					$('#subcategory').append($('<option>', { 
						value: item.subcategoryid,
						text : item.subcategoryname 
					}));
				});
				*/
				arrSubCate = data.resultsub;

				if($("#newsid").val() != ''){
					// Call ajax to get location
					var input = {"newsid" : $("#newsid").val()};
					$.ajax({
						url: '/getadmnews',
						type: 'POST',
						data: input,
						success: function(data){
							if(data.result){
								// Draw data
								oldJson = data.result;
								$("#title").val(data.result.title);
								$("#category").val(data.result.categoryid);
								filerCategory(data.result.categoryid);
								$("#subcategory").val(data.result.subcategoryid);
								$("#content").val(data.result.content);

								// Draw image
								var img = '<img width="200px" height="auto" src="'+ data.result.image +'">';
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

	// select category change
	$("#category").change(function(){
		var myselect = document.getElementById("category");
		filerCategory(myselect.options[myselect.selectedIndex].value);
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
					if (currentSubCate >= 30) {
						window.location.href = '/listnewtips';
					} else if (currentSubCate >= 20) {
						window.location.href = '/listnewdd';
					} else {
						window.location.href = '/listnewsch';
					}
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
		if (currentSubCate >= 30) {
			window.location.href = '/listnewtips';
		} else if (currentSubCate >= 20) {
			window.location.href = '/listnewdd';
		} else {
			window.location.href = '/listnewsch';
		}
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