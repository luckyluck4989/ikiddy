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
var editor1;
var editor2;
var editor3;
$(document).ready(function() {
	// Show editor
	// The instanceReady event is fired, when an instance of CKEditor has finished
	// its initialization.
	CKEDITOR.on( 'instanceReady', function( ev ) {
		if (ev.editor.name == 'material') {
			editor1 = ev.editor;
		} else if (ev.editor.name == 'method') {
			editor2 = ev.editor;
		} else {
			editor3 = ev.editor;
		}

		// Event fired when the readOnly property changes.
		editor.on( 'readOnly', function() {
			document.getElementById( 'readOnlyOn' ).style.display = this.readOnly ? 'none' : '';
			document.getElementById( 'readOnlyOff' ).style.display = this.readOnly ? '' : 'none';
		});
	});

	$("#title").focus();

	// Call ajax to get category and subcategory
	$.ajax({
		url: '/getlistcc',
		type: 'POST',
		data: '',
		success: function(data){
			if(data.result){

				if($("#itemid").val() != ''){
					// Call ajax to get location
					var input = {"itemid" : $("#itemid").val()};
					$.ajax({
						url: '/getadmm365',
						type: 'POST',
						data: input,
						success: function(data){
							if(data.result){
								// Draw data
								oldJson = data.result;
								$("#name").val(data.result.name);
								//$("#material").val(data.result.materials);
								//$("#method").val(data.result.method);
								$("#meals").val(data.result.meals);
								$("#cook").val(data.result.cook);
								$("#age").val(data.result.age);
								$("#mainmaterial").val(data.result.mainmaterial);
								//$("#description").val(data.result.description);
								editor1.insertHtml(data.result.materials);
								editor2.insertHtml(data.result.method);
								editor3.insertHtml(data.result.description);
								

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
					$("#name").focus();
					$("#material").val('');
					$("#method").val('');
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
			$('#addItemForm').ajaxForm({
				beforeSubmit : function(formData, jqForm, options){
					formData.push({name:"image", value:arrImage[0]});
				},
				success	: function(responseText, status, xhr, $form){
					window.location.href = '/listm365';
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
		window.location.href = '/listm365';
	});
});