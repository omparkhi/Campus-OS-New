const CampusConfig = require('../models/CampusConfig');

exports.chat = async (req, res) => {
  const userMessage = req.body.message || "";  // ✅ SAFE COPY
  try {
    const { history = [] } = req.body;

    // Fetch campus config for AI context
    let config = await CampusConfig.findOne();
    if (!config) {
      config = await CampusConfig.create({});
    }

    const contextData = JSON.stringify({
      processingTimes: config.processingTimes,
      requiredDocuments: config.requiredDocuments,
      officeHours: config.officeHours,
      importantNotes: config.importantNotes,
      contactInfo: config.contactInfo
    }, null, 2);

    const systemPrompt = `You are CampusBot, a helpful assistant for PBCE Nagpur's administrative portal CampusOS.
You help students with questions about certificate requests, processing times, required documents, and campus procedures.
Always be friendly, concise, and accurate. Use the campus data below to answer questions.

CAMPUS DATA:
${contextData}

Rules:
- Only answer questions related to campus admin processes, certificates, and the portal
- If asked about something outside this scope, politely redirect to campus admin topics
- Be specific with document requirements and timelines from the data above
- Format responses clearly with bullet points when listing documents`;

    const apiKey = process.env.GEMINI_API_KEY;

    
    if (!apiKey || apiKey === 'your_gemini_api_key_from_google_ai_studio') {
      // Fallback mock response when no API key
      const mockResponses = {
        'bonafide': `For a **Bonafide Certificate**, you need:\n• Student ID\n• Fee receipt of current semester\n\nProcessing time: **2-3 working days**\nCollect from: Admin Office, Room 101`,
        'tc': `For a **Transfer Certificate**, you need:\n• Fee clearance certificate\n• Library NOC\n• Hostel NOC (if applicable)\n• Original ID card\n\nProcessing time: **5-7 working days**`,
        'id card': `For **ID Card replacement**, you need:\n• Passport photo (2 copies)\n• Fee receipt\n• Previous ID card (if replacement)\n\nProcessing time: **3-5 working days**`,
        'noc': `For a **NOC**, you need:\n• Application letter\n• Event/internship details\n• HOD approval form\n\nProcessing time: **1-2 working days** — fastest request type!`,
        'hours': `**Office Hours:**\nMon-Fri: 9:00 AM – 5:00 PM\nLunch: 1:00 PM – 2:00 PM\nSaturday: 9:00 AM – 1:00 PM`,
      };

      const lowerMsg = userMessage.toLowerCase();
      let reply = `I'm CampusBot! 👋 I can help you with questions about certificates, ID cards, and admin processes.\n\nTry asking:\n• "What documents do I need for a Bonafide Certificate?"\n• "How long does a TC take?"\n• "What are office hours?"`;
      
      for (const [key, response] of Object.entries(mockResponses)) {
        if (lowerMsg.includes(key)) {
          reply = response;
          break;
        }
      }

      return res.json({ success: true, reply, note: 'Using demo mode. Add GEMINI_API_KEY for full AI.' });
    }

    // Real Gemini API call
    // const { GoogleGenerativeAI } = require('@google/generative-ai');
    // const genAI = new GoogleGenerativeAI(apiKey);
    // const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(apiKey);

// const models = await genAI.listModels();
const model = genAI.getGenerativeModel({
  model: 'gemini-pro'
});

    const chat = model.startChat({
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.content }]
      })),
      generationConfig: { maxOutputTokens: 500 }
    });

    // Prepend system context to first message
    const fullMessage = history.length === 0
      ? `[System: ${systemPrompt}]\n\nStudent question: ${userMessage}`
      : userMessage;

    const result = await chat.sendMessage(fullMessage);
    const reply = result.response.text();

    res.json({ success: true, reply });
  } catch (error) {
  console.error('Chat error:', error);

  const lowerMsg = userMessage.toLowerCase(); // ✅ now safe

  let reply = `I'm CampusBot 👋

I can help with:
• Certificates
• Documents
• Office info

Try asking:
"Bonafide certificate documents"`;

  if (lowerMsg.includes('bonafide')) {
    reply = `For a **Bonafide Certificate**, you need:
• Student ID
• Fee receipt

Processing time: **2-3 days**`;
  } 
  else if (lowerMsg.includes('tc')) {
    reply = `For a **Transfer Certificate**, you need:
• Fee clearance
• Library NOC

Processing time: **5-7 days**`;
  } 
  else if (lowerMsg.includes('id card')) {
    reply = `For **ID Card replacement**:
• Passport photo
• Fee receipt

Processing time: **3-5 days**`;
  } 
  else if (lowerMsg.includes('noc')) {
    reply = `For **NOC**:
• Application letter
• HOD approval

Processing time: **1-2 days**`;
  } 
  else if (lowerMsg.includes('hours')) {
    reply = `**Office Hours:**
Mon-Fri: 9 AM – 5 PM
Sat: 9 AM – 1 PM`;
  }

  return res.json({
    success: true,
    reply,
    fallback: true
  });
}
};

exports.updateConfig = async (req, res) => {
  try {
    let config = await CampusConfig.findOne();
    if (!config) {
      config = new CampusConfig();
    }

    const { processingTimes, requiredDocuments, officeHours, importantNotes, contactInfo } = req.body;

    if (processingTimes) config.processingTimes = processingTimes;
    if (requiredDocuments) config.requiredDocuments = requiredDocuments;
    if (officeHours) config.officeHours = officeHours;
    if (importantNotes) config.importantNotes = importantNotes;
    if (contactInfo) config.contactInfo = contactInfo;
    config.updatedBy = req.user._id;

    await config.save();
    res.json({ success: true, config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getConfig = async (req, res) => {
  try {
    let config = await CampusConfig.findOne();
    if (!config) config = await CampusConfig.create({});
    res.json({ success: true, config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
