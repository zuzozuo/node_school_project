$(document).ready(function() {
  console.log("siema siema jestem działającym skyptem");


  /*-------TOOLTIP DLA TABELI-----------*/
  $('.table_info').hover(function() {
    var title = $(this).attr('title');
    $(this).data('tipText', title).removeAttr('title');
    $('<p class="tooltip"></p>')
      .text(title)
      .appendTo('body')
      .fadeIn('slow');
  }, function() {

    $(this).attr('title', $(this).data('tipText'));
    $('.tooltip').remove();
  }).mousemove(function(e) {
    var mousex = e.pageX + 20;
    var mousey = e.pageY + 10;
    $('.tooltip')
      .css({
        top: mousey,
        left: mousex
      })
  });


  /*-------SELECT----------*/

  $("#display_btn").on('click', function() {
    var display = $('select[name="widok"]').val();
    console.log(display)

    if (display == "lista") {
      $(".list_display").css("display", "block"); //POROBIONE NARESZCIE X'DD
      $(".table_display").css("display", "none");
      $(".tiles_display").css("display", "none");
    } else if (display == "kafelki") {
      $(".list_display").css("display", "none"); //POROBIONE NARESZCIE X'DD
      $(".table_display").css("display", "none");
      $(".tiles_display").css("display", "flex");
    } else {
      $(".list_display").css("display", "none"); //POROBIONE NARESZCIE X'DD
      $(".table_display").css("display", "inline");
      $(".tiles_display").css("display", "none");
    }

  })

});
