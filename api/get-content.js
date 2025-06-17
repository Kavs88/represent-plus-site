const Airtable = require('airtable');

module.exports = async (req, res) => {
  try {
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      throw new Error("Server configuration error: Missing API credentials.");
    }
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

    const artistRecords = await base('Artists').select({ filterByFormula: "{Status} = 'Active'" }).all();
    const artists = artistRecords.map(record => ({
      id: record.id,
      name: record.get('Name') || 'Unnamed Artist',
      specialty: record.get('Specialty') || '',
      profileImageUrl: record.get('Profile_Image') ? record.get('Profile_Image')[0].url : 'https://via.placeholder.com/800x1000.png?text=No+Image',
      portfolio: JSON.parse(record.get('Portfolio_JSON') || '[]')
    }));
    
    return res.status(200).json({ artists: artists, testimonials: [] });

  } catch (error) {
    console.error('--- AIRTABLE API ERROR ---', error);
    return res.status(500).json({ 
      error: 'A critical error occurred while fetching data.',
      details: { message: error.message, code: error.statusCode }
    });
  }
};