require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { jsPDF } = require('jspdf');
const autoTable = require('jspdf-autotable');
const app = express();
const port = 3000;

// Middleware to serve static files
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Function to generate the PDF
function generatePDF(data) {
    const doc = new jsPDF();

    // Ensure data properties exist and provide default values if undefined
    const city = data.city || 'Unknown City';
    const population = data.population !== undefined ? data.population.toLocaleString() : 'N/A';
    const requirement2024 = data.requirement2024 !== undefined ? data.requirement2024.toLocaleString() : 'N/A';
    const requirement2025 = data.requirement2025 !== undefined ? data.requirement2025.toLocaleString() : 'N/A';

    doc.text(`Procurement Requirements for ${city}`, 10, 10);
    doc.text(`Population: ${population}`, 10, 20);

    doc.text('2024 Procurement Requirements:', 10, 30);
    doc.text(`${requirement2024} tons`, 10, 40);

    doc.text('2025 Procurement Requirements:', 10, 50);
    doc.text(`${requirement2025} tons`, 10, 60);

    return doc;
}


// GET request to render the form with the initial state
app.get('/', (req, res) => {
    res.render('form', {
        title: 'SB 1383 Compliance Calculator',
        city: null,
        population: null,
        requirement2024: null,
        requirement2025: null,
        results2024: null,  // Pass null or {}
        results2025: null   // Pass null or {}
    });
});



// POST request to handle form submission and render results
app.post('/', (req, res) => {
    const city = req.body.city;
    const population = parseInt(req.body.population);

    // Calculations for 2024 and 2025
    const requirement2024 = 0.08 * population * 0.65;
    const requirement2025 = 0.08 * population;

    // Constants from the table
    const constants = {
        electricityPCA: 650,
        renewableGasFuel: 21,
        electricityRenewableGas: 242,
        heatRenewableGas: 22,
        compostTons: 0.58,
        compostCubicYards: 1.45,
        mulch: 1
    };

    // Calculations for the second table based on the constants
    const results2024 = {
        electricityPCA: requirement2024 * constants.electricityPCA,
        renewableGasFuel: requirement2024 * constants.renewableGasFuel,
        electricityRenewableGas: requirement2024 * constants.electricityRenewableGas,
        heatRenewableGas: requirement2024 * constants.heatRenewableGas,
        compostTons: requirement2024 * constants.compostTons,
        compostCubicYards: requirement2024 * constants.compostCubicYards,
        mulch: requirement2024 * constants.mulch
    };

    const results2025 = {
        electricityPCA: requirement2025 * constants.electricityPCA,
        renewableGasFuel: requirement2025 * constants.renewableGasFuel,
        electricityRenewableGas: requirement2025 * constants.electricityRenewableGas,
        heatRenewableGas: requirement2025 * constants.heatRenewableGas,
        compostTons: requirement2025 * constants.compostTons,
        compostCubicYards: requirement2025 * constants.compostCubicYards,
        mulch: requirement2025 * constants.mulch
    };

    // Render the same form view with results populated in Step 2
    res.render('form', {
        title: 'SB 1383 Compliance Calculator',
        city: city,
        population: population,
        requirement2024: requirement2024,
        requirement2025: requirement2025,
        results2024: results2024,
        results2025: results2025
    });
});



// Route for form submission and calculation
app.post('/calculate', (req, res) => {
    const city = req.body.city;
    const population = parseInt(req.body.population);

    // Calculations for 2024 and 2025
    const requirement2024 = 0.08 * population * 0.65;
    const requirement2025 = 0.08 * population;

    // Constants from the table
    const constants = {
        electricityPCA: 650,
        renewableGasFuel: 21,
        electricityRenewableGas: 242,
        heatRenewableGas: 22,
        compostTons: 0.58,
        compostCubicYards: 1.45,
        mulch: 1
    };

    // Calculations for the second table based on the constants
    const results2024 = {
        electricityPCA: requirement2024 * constants.electricityPCA,
        renewableGasFuel: requirement2024 * constants.renewableGasFuel,
        electricityRenewableGas: requirement2024 * constants.electricityRenewableGas,
        heatRenewableGas: requirement2024 * constants.heatRenewableGas,
        compostTons: requirement2024 * constants.compostTons,
        compostCubicYards: requirement2024 * constants.compostCubicYards,
        mulch: requirement2024 * constants.mulch
    };

    const results2025 = {
        electricityPCA: requirement2025 * constants.electricityPCA,
        renewableGasFuel: requirement2025 * constants.renewableGasFuel,
        electricityRenewableGas: requirement2025 * constants.electricityRenewableGas,
        heatRenewableGas: requirement2025 * constants.heatRenewableGas,
        compostTons: requirement2025 * constants.compostTons,
        compostCubicYards: requirement2025 * constants.compostCubicYards,
        mulch: requirement2025 * constants.mulch
    };

    // Render the result view and pass the title
    res.render('result', {
        title: 'Compliance Results',
        city: city,
        population: population,
        requirement2024: requirement2024,
        requirement2025: requirement2025,
        results2024: results2024,
        results2025: results2025
    });
});

// Route to render the 'Find Out More' page
app.get('/find-out-more', (req, res) => {
    const city = req.query.city || 'City/County';
    res.render('find-out-more', { city: city, title: 'Find Out More' });
});

app.post('/send-email', (req, res) => {
    const { email, subject, message, city, population, requirement2024, requirement2025, results2024, results2025 } = req.body;

    // Create a new PDF document on the server
    const doc = new jsPDF();

    // Set up the document layout without the logo
    doc.setFontSize(16);
    doc.text('Valinor Energy', doc.internal.pageSize.getWidth() / 2, 30, null, null, 'center');

    // Add title and introductory text
    doc.setFontSize(14);
    doc.text(`Procurement Requirements for ${city}`, 10, 50);
    doc.setFontSize(12);
    doc.text(`Population: ${parseInt(population).toLocaleString()}`, 10, 60);

    // Add Procurement Requirements title and table
    doc.setFontSize(14);
    doc.text('Procurement Requirements', 10, 70);
    autoTable(doc, {
        startY: 75,
        head: [['Requirement', '2024', '2025']],
        body: [
            ['SB 1383 ROWP Procurement Requirement', `${parseFloat(requirement2024).toLocaleString()} tons`, `${parseFloat(requirement2025).toLocaleString()} tons`],
        ],
        theme: 'striped',
        styles: { cellPadding: 3, halign: 'center' },
        columnStyles: { 0: { halign: 'left' }, 1: { halign: 'right' }, 2: { halign: 'right' } }
    });

    // Add Total Purchases title and table
    doc.text('Total purchases by option to meet SB 1383 procurement requirements', 10, doc.lastAutoTable.finalY + 10);
    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 15, // Spacing after the first table
        head: [['Option', '2024', '2025']],
        body: [
            ['Electricity Needed for one PCA', `${results2024.electricityPCA.toLocaleString()} kWh`, `${results2025.electricityPCA.toLocaleString()} kWh`],
            ['Renewable Gas in the form of Transportation Fuel', `${results2024.renewableGasFuel.toLocaleString()} DGE`, `${results2025.renewableGasFuel.toLocaleString()} DGE`],
            ['Electricity from Renewable Gas', `${results2024.electricityRenewableGas.toLocaleString()} kWh`, `${results2025.electricityRenewableGas.toLocaleString()} kWh`],
            ['Heat from Renewable Gas', `${results2024.heatRenewableGas.toLocaleString()} therms`, `${results2025.heatRenewableGas.toLocaleString()} therms`],
            ['Compost (Tons)', `${results2024.compostTons.toLocaleString()} tons`, `${results2025.compostTons.toLocaleString()} tons`],
            ['Compost (Cubic Yards)', `${results2024.compostCubicYards.toLocaleString()} cubic yards`, `${results2025.compostCubicYards.toLocaleString()} cubic yards`],
            ['Mulch', `${results2024.mulch.toLocaleString()} tons`, `${results2025.mulch.toLocaleString()} tons`],
        ],
        theme: 'striped',
        styles: { cellPadding: 3, halign: 'center' },
        columnStyles: { 0: { halign: 'left' }, 1: { halign: 'right' }, 2: { halign: 'right' } }
    });

    // Get the PDF as a buffer to attach to the email
    const pdfBuffer = doc.output('arraybuffer');

    // Create a transporter object using Zoho Mail's SMTP settings
    let transporter = nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.ZOHO_USER,
            pass: process.env.ZOHO_PASS
        }
    });

    // Email options
    let mailOptions = {
        from: process.env.ZOHO_USER,
        to: 'todd@toddbrannon.com',
        subject: subject,
        text: message,
        replyTo: email,
        attachments: [
            {
                filename: 'procurement_requirements.pdf',
                content: Buffer.from(pdfBuffer),
                contentType: 'application/pdf'
            }
        ]
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.send('Error sending email');
        } else {
            console.log('Email sent: ' + info.response);
            res.redirect('/success');
        }
    });
});


// Route for success page
app.get('/success', (req, res) => {
    res.render('success', { title: 'Message Sent' });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
