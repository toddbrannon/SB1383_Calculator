$(document).ready(function () {
    // Navigation between steps using buttons
    $('.next-step').click(function() {
        $('#calculatorTabs .active').next('li').find('a').trigger('click');
    });

    $('.prev-step').click(function() {
        $('#calculatorTabs .active').prev('li').find('a').trigger('click');
    });

    // Currency input formatting
    $('.currencyInput').on('blur', function() {
        let value = parseFloat(this.value).toFixed(2);
        if (!isNaN(value)) {
            this.value = '$' + value;
        }
    });

    $('.currencyInput').on('focus', function() {
        this.value = this.value.replace('$', '');
    });

    // Calculation logic
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
            $targetTab.trigger('click');
        }
    }
});
