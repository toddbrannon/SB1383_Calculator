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
    // $('#nextBtn').click(function() {
    //     var $activeTab = $('.nav-tabs .nav-link.active');
    //     var $nextTab = $activeTab.parent().next().find('.nav-link');

    //     // Check if the next tab is actually the second tab
    //     if ($nextTab.length && $nextTab.attr('id') === 'step2-tab') {
    //         $nextTab.tab('show');
    //     }
    // });

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

    $('#nextBtn').click(function(e) {
        e.preventDefault(); // Prevent default button behavior
        
        // If we're on the first step, submit the form
        if ($('#step1-tab').hasClass('active')) {
            $('#step1Form').submit();
        } else {
            // For other steps, just navigate to the next tab
            var $activeTab = $('.nav-tabs .nav-link.active');
            var $nextTab = $activeTab.parent().next().find('.nav-link');
            if ($nextTab.length) {
                $nextTab.tab('show');
            }
        }
    });

    // Step 1 form submission handler
    $('#step1Form').on('submit', function(e) {
        e.preventDefault();
        $.ajax({
            url: '/step1',
            method: 'POST',
            data: $(this).serialize(),
            success: function(response) {
                // Replace the entire page content with the response
                document.open();
                document.write(response);
                document.close();
                
                // After replacing content, show the second tab
                $('#step2-tab').tab('show');
                
                // Reinitialize any necessary JavaScript
                initializeScripts();
            },
            error: function(xhr, status, error) {
                console.error("Error submitting form:", error);
            }
        });
    });

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

    function adjustBackgroundHeight() {
        // Get the height of the container
        var containerHeight = $('.container').outerHeight();
        // Calculate the top offset (20vh)
        var topOffset = $(window).height() * 0.2;
        // Set the height of the background-bottom
        $('.background-bottom').css('height', containerHeight + topOffset + 'px');
    }

    // Adjust on load
    adjustBackgroundHeight();

    // Adjust on window resize
    $(window).resize(function() {
        adjustBackgroundHeight();
    });

    // Adjust on tab change (in case the content height changes)
    $('a[data-bs-toggle="tab"]').on('shown.bs.tab', function () {
        adjustBackgroundHeight();
    });

    // Function to reinitialize scripts after content update
    function initializeScripts() {
        // Re-attach event handlers and reinitialize any plugins
        // This will depend on what scripts need to be reinitialized
        // For example:
        validateStep1();
        adjustBackgroundHeight();
        // ... any other initialization code
    }

    $(document).ready(function() {
        // Conversion rates
        const conversionRates = {
            'Compost': {
                'tons': 1 / 0.58,
                'cubic yards': 1 / 1.45
            },
            'Mulch': {
                'tons': 1
            },
            'RNG': {
                'DGE': 1 / 21,
                'kWh': 1 / 242,
                'therms': 1 / 22
            },
            'other (in ROWP tons)': {
                'tons': 1
            }
        };

        // Units for each item
        const units = {
            'Compost': ['tons', 'cubic yards'],
            'Mulch': ['tons'],
            'RNG': ['DGE', 'kWh', 'therms'],
            'other (in ROWP tons)': ['tons']
        };

        // Populate select options based on item
        $('.unit-select').each(function() {
            const item = $(this).closest('.row').find('h5').text().replace('Current Procurement of ', '');
            const unitSelect = $(this);
            unitSelect.empty(); // Clear existing options
            units[item].forEach(unit => {
                unitSelect.append(new Option(unit, unit));
            });
        });
    
        // Function to calculate the equivalent ROWP tons
        function calculateEquivalentRowpTons() {
            let totalRowpTons = 0;
            $('.volume-input').each(function() {
                const item = $(this).closest('.row').find('h5').text().replace('Current Procurement of ', '');
                const unit = $(this).closest('.row').find('.unit-select').val();
                const volume = parseFloat($(this).val()) || 0;
                const conversionRate = conversionRates[item][unit] || 0;
                totalRowpTons += volume * conversionRate;
            });
            $('#total-volume').val(totalRowpTons.toFixed(2));
            return totalRowpTons;
        }

        // Function to calculate the current compliance percentage
        function calculateCurrentCompliance(totalRowpTons) {
            const population = parseFloat($('#population').val()) || 0;
            const targetRowpTons = Math.round(population * 0.8 * 0.65);
            const compliancePercentage = (totalRowpTons / targetRowpTons) * 100;
            $('#current-compliance').val(compliancePercentage.toFixed(2) + '%');
        }

        // Function to calculate the total cost
        function calculateTotalCost() {
            let totalCost = 0;
            $('.cost-input').each(function() {
                const cost = parseFloat($(this).val()) || 0;
                totalCost += cost;
            });
            $('#total-cost').val('$' + totalCost.toFixed(0));
        }
    
        // Attach event listeners to volume inputs and unit selects
        $('.volume-input, .unit-select').on('input change', function() {
            calculateEquivalentRowpTons();
            const totalRowpTons = calculateEquivalentRowpTons();
            calculateCurrentCompliance(totalRowpTons);
        });

        $('.cost-input').on('input change', function() {
            calculateTotalCost();
        });
    
        const initialTotalRowpTons = calculateEquivalentRowpTons();
        calculateCurrentCompliance(initialTotalRowpTons);

        const initialTotalCost = calculateTotalCost();
        calculateTotalCost(initialTotalCost);
    });

});

