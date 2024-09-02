$(document).ready(function () {
    // Validation logic for Step 1
    $('#city, #population').on('input', function() {
        validateStep1();
    });

    function validateStep1() {
        var cityValid = $('#city').val().length >= 2;
        var populationValid = Number.isInteger(parseFloat($('#population').val())) && parseFloat($('#population').val()) > 0;
        
        if (cityValid && populationValid) {
            $('#nextBtn').removeClass('btn-secondary').addClass('btn-success').prop('disabled', false);
        } else {
            $('#nextBtn').removeClass('btn-success').addClass('btn-secondary').prop('disabled', true);
        }
    }

    // Explicit navigation control for Next button
    $('#nextBtn').click(function() {
        var $activeTab = $('.nav-tabs .nav-link.active');
        var $nextTab = $activeTab.parent().next().find('.nav-link');

        // Check if the next tab is actually the second tab
        if ($nextTab.length && $nextTab.attr('id') === 'step2-tab') {
            $nextTab.tab('show');
        }
    });

    // Navigation for the Back button
    $('.prev-step').click(function() {
        var $activeTab = $('.nav-tabs .nav-link.active');
        var $prevTab = $activeTab.parent().prev().find('.nav-link');

        if ($prevTab.length) {
            $prevTab.tab('show');
        }
    });

    // Initialize Hammer.js for swipe detection
    var hammerTabs = new Hammer(document.getElementById('formContent'));

    hammerTabs.on('swipeleft', function() {
        navigateTabs('next');
    });

    hammerTabs.on('swiperight', function() {
        navigateTabs('prev');
    });

    function navigateTabs(direction) {
        var $activeTab = $('.nav-tabs .nav-link.active');
        var $targetTab;

        if (direction === 'next') {
            $targetTab = $activeTab.parent().next().find('.nav-link');
        } else if (direction === 'prev') {
            $targetTab = $activeTab.parent().prev().find('.nav-link');
        }

        if ($targetTab && $targetTab.length) {
            $targetTab.tab('show');
        }
    }

    // Currency input formatting (existing functionality)
    $('.currencyInput').on('blur', function() {
        let value = parseFloat(this.value).toFixed(2);
        if (!isNaN(value)) {
            this.value = '$' + value;
        }
    });

    $('.currencyInput').on('focus', function() {
        this.value = this.value.replace('$', '');
    });

    // Calculation logic (existing functionality)
    $('#calculateBtn').on('click', function() {
        let sumColumn2 = 0;
        let sumColumn4 = 0;

        $('.column-2 input[type="number"]').each(function() {
            sumColumn2 += parseFloat($(this).val()) || 0;
        });

        $('.column-4 input[type="number"]').each(function() {
            sumColumn4 += parseFloat($(this).val()) || 0;
        });

        $('#sum-column-2').text(sumColumn2.toFixed(2));
        $('#sum-column-4').text('$' + sumColumn4.toFixed(2));
    });
});
