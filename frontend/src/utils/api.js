/**
 * API client for the WhatsApp Orchestrator backend.
 * Falls back to mock data when the backend is unavailable.
 */

const API_BASE = '/api';

async function fetchApi(endpoint) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`API call failed (${endpoint}), using mock data:`, err.message);
    return null;
  }
}

async function postApi(endpoint, body) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`API POST failed (${endpoint}):`, err.message);
    return null;
  }
}

// ─── API Methods ────────────────────────────────────────────

export async function fetchTenants() {
  const data = await fetchApi('/tenants');
  return data?.tenants || MOCK_TENANTS;
}

export async function fetchConversations(tenantId) {
  const data = await fetchApi(`/tenants/${tenantId}/conversations`);
  return data?.conversations || MOCK_CONVERSATIONS[tenantId] || [];
}

export async function fetchMessages(conversationId) {
  const data = await fetchApi(`/conversations/${conversationId}/messages`);
  return data || MOCK_MESSAGES[conversationId] || { conversation: {}, messages: [] };
}

export async function sendBroadcast(tenantId, payload) {
  return await postApi(`/tenants/${tenantId}/broadcast`, payload);
}

// ─── Mock Data (Used when backend is offline) ───────────────

const MOCK_TENANTS = [
  {
    tenant_id: 'tenant-a-luxury-furniture',
    name: 'Luxe Living Furniture',
    whatsapp_phone_number_id: '123456789',
  },
  {
    tenant_id: 'tenant-b-automotive-care',
    name: 'AutoPro Service Center',
    whatsapp_phone_number_id: '987654321',
  },
];

const MOCK_CONVERSATIONS = {
  'tenant-a-luxury-furniture': [
    {
      conversation_id: 'conv-1',
      tenant_id: 'tenant-a-luxury-furniture',
      customer_phone: '+1 (555) 234-5678',
      status: 'WAITING_FOR_BOT',
      created_at: '2026-06-21T09:30:00Z',
      updated_at: '2026-06-21T10:15:00Z',
      last_message: { text: 'Can I see the new sofa collection?', direction: 'inbound', message_type: 'text', timestamp: '2026-06-21T10:15:00Z' },
    },
    {
      conversation_id: 'conv-2',
      tenant_id: 'tenant-a-luxury-furniture',
      customer_phone: '+1 (555) 876-5432',
      status: 'AGENT_RESPONDING',
      created_at: '2026-06-21T08:00:00Z',
      updated_at: '2026-06-21T10:12:00Z',
      last_message: { text: 'Send me your product catalog please', direction: 'inbound', message_type: 'text', timestamp: '2026-06-21T10:12:00Z' },
    },
    {
      conversation_id: 'conv-3',
      tenant_id: 'tenant-a-luxury-furniture',
      customer_phone: '+44 7700 900123',
      status: 'NEEDS_HUMAN',
      created_at: '2026-06-21T07:00:00Z',
      updated_at: '2026-06-21T09:45:00Z',
      last_message: { text: 'This is unacceptable! I want to speak to a manager!', direction: 'inbound', message_type: 'text', timestamp: '2026-06-21T09:45:00Z' },
    },
    {
      conversation_id: 'conv-4',
      tenant_id: 'tenant-a-luxury-furniture',
      customer_phone: '+91 98765 43210',
      status: 'RESOLVED',
      created_at: '2026-06-20T14:00:00Z',
      updated_at: '2026-06-20T14:30:00Z',
      last_message: { text: 'Thank you so much! The table looks perfect.', direction: 'inbound', message_type: 'text', timestamp: '2026-06-20T14:30:00Z' },
    },
  ],
  'tenant-b-automotive-care': [
    {
      conversation_id: 'conv-5',
      tenant_id: 'tenant-b-automotive-care',
      customer_phone: '+1 (555) 111-2222',
      status: 'WAITING_FOR_BOT',
      created_at: '2026-06-21T10:00:00Z',
      updated_at: '2026-06-21T10:20:00Z',
      last_message: { text: 'I need to book a brake inspection for my Honda Civic', direction: 'inbound', message_type: 'text', timestamp: '2026-06-21T10:20:00Z' },
    },
    {
      conversation_id: 'conv-6',
      tenant_id: 'tenant-b-automotive-care',
      customer_phone: '+1 (555) 333-4444',
      status: 'AGENT_RESPONDING',
      created_at: '2026-06-21T09:00:00Z',
      updated_at: '2026-06-21T10:10:00Z',
      last_message: { text: 'Can you send me the repair diagram for the engine?', direction: 'inbound', message_type: 'text', timestamp: '2026-06-21T10:10:00Z' },
    },
    {
      conversation_id: 'conv-7',
      tenant_id: 'tenant-b-automotive-care',
      customer_phone: '+49 170 1234567',
      status: 'RESOLVED',
      created_at: '2026-06-20T16:00:00Z',
      updated_at: '2026-06-20T16:45:00Z',
      last_message: { text: 'Thanks, invoice received!', direction: 'inbound', message_type: 'text', timestamp: '2026-06-20T16:45:00Z' },
    },
  ],
};

const MOCK_MESSAGES = {
  'conv-1': {
    conversation: MOCK_CONVERSATIONS['tenant-a-luxury-furniture'][0],
    messages: [
      { message_id: 'm1', direction: 'inbound', sender: '+1 (555) 234-5678', text: 'Hi, I\'m interested in your furniture collection', message_type: 'text', timestamp: '2026-06-21T09:30:00Z' },
      { message_id: 'm2', direction: 'outbound', sender: 'bot', text: 'Welcome to *Luxe Living Furniture*! 🌟 We\'d love to help you find the perfect piece. Are you looking for something specific, or would you like to browse our full catalog?', message_type: 'text', timestamp: '2026-06-21T09:30:15Z' },
      { message_id: 'm3', direction: 'inbound', sender: '+1 (555) 234-5678', text: 'Can I see the new sofa collection?', message_type: 'text', timestamp: '2026-06-21T10:15:00Z' },
      { message_id: 'm4', direction: 'outbound', sender: 'bot', text: 'Of course! Here\'s our stunning _Milano Collection_ leather sofa — handcrafted Italian leather with a lifetime warranty. Prices start at $2,499.', message_type: 'text', timestamp: '2026-06-21T10:15:20Z' },
      { message_id: 'm5', direction: 'outbound', sender: 'bot', text: '', message_type: 'image', media: { url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400', mime_type: 'image/jpeg' }, timestamp: '2026-06-21T10:15:22Z' },
    ],
  },
  'conv-2': {
    conversation: MOCK_CONVERSATIONS['tenant-a-luxury-furniture'][1],
    messages: [
      { message_id: 'm6', direction: 'inbound', sender: '+1 (555) 876-5432', text: 'Hello, do you have a product catalog?', message_type: 'text', timestamp: '2026-06-21T08:00:00Z' },
      { message_id: 'm7', direction: 'outbound', sender: 'bot', text: 'Absolutely! Here\'s our latest 2025 catalog with our complete collection and pricing:', message_type: 'text', timestamp: '2026-06-21T08:00:18Z' },
      { message_id: 'm8', direction: 'outbound', sender: 'bot', text: '', message_type: 'document', media: { url: '#', mime_type: 'application/pdf', filename: 'LuxeLiving_Catalog_2025.pdf' }, timestamp: '2026-06-21T08:00:20Z' },
      { message_id: 'm9', direction: 'inbound', sender: '+1 (555) 876-5432', text: 'Thanks! Do you also have a showroom I can visit?', message_type: 'text', timestamp: '2026-06-21T10:10:00Z' },
      { message_id: 'm10', direction: 'outbound', sender: 'bot', text: 'Yes! Our flagship showroom is located at 450 Design Avenue, Manhattan. Open Mon-Sat 10am-7pm. Here\'s a peek inside:', message_type: 'text', timestamp: '2026-06-21T10:10:15Z' },
      { message_id: 'm11', direction: 'outbound', sender: 'bot', text: '', message_type: 'image', media: { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400', mime_type: 'image/jpeg' }, timestamp: '2026-06-21T10:10:17Z' },
      { message_id: 'm12', direction: 'inbound', sender: '+1 (555) 876-5432', text: 'Send me your product catalog please', message_type: 'text', timestamp: '2026-06-21T10:12:00Z' },
    ],
  },
  'conv-3': {
    conversation: MOCK_CONVERSATIONS['tenant-a-luxury-furniture'][2],
    messages: [
      { message_id: 'm13', direction: 'inbound', sender: '+44 7700 900123', text: 'My order #4521 was supposed to arrive last week!', message_type: 'text', timestamp: '2026-06-21T07:00:00Z' },
      { message_id: 'm14', direction: 'outbound', sender: 'bot', text: 'I sincerely apologize for the delay with order #4521. Let me look into this for you right away.', message_type: 'text', timestamp: '2026-06-21T07:00:12Z' },
      { message_id: 'm15', direction: 'inbound', sender: '+44 7700 900123', text: 'This is unacceptable! I want to speak to a manager!', message_type: 'text', timestamp: '2026-06-21T09:45:00Z' },
      { message_id: 'm16', direction: 'outbound', sender: 'bot', text: 'I understand your frustration, and I want to make sure you get the best help possible. I\'m connecting you with a human representative who can assist you further. Please hold on — someone will be with you shortly.', message_type: 'text', timestamp: '2026-06-21T09:45:08Z' },
    ],
  },
  'conv-5': {
    conversation: MOCK_CONVERSATIONS['tenant-b-automotive-care'][0],
    messages: [
      { message_id: 'm17', direction: 'inbound', sender: '+1 (555) 111-2222', text: 'Hi, I need to book a brake inspection for my Honda Civic', message_type: 'text', timestamp: '2026-06-21T10:00:00Z' },
      { message_id: 'm18', direction: 'outbound', sender: 'bot', text: 'Hello! I\'d be happy to help you schedule a brake inspection for your Honda Civic. 🔧\n\nCould you provide:\n1. Your preferred date and time?\n2. Year of your Honda Civic?\n3. Any specific concerns (noise, vibration, etc.)?', message_type: 'text', timestamp: '2026-06-21T10:00:14Z' },
      { message_id: 'm19', direction: 'inbound', sender: '+1 (555) 111-2222', text: 'It\'s a 2022 model. Hearing a squealing noise. Can you do Thursday at 10am?', message_type: 'text', timestamp: '2026-06-21T10:15:00Z' },
      { message_id: 'm20', direction: 'outbound', sender: 'bot', text: 'Thursday at 10 AM works! I\'ve tentatively booked you in. Here\'s a brake system diagram so you can see what we\'ll be inspecting:', message_type: 'text', timestamp: '2026-06-21T10:15:12Z' },
      { message_id: 'm21', direction: 'outbound', sender: 'bot', text: '', message_type: 'image', media: { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400', mime_type: 'image/jpeg' }, timestamp: '2026-06-21T10:15:14Z' },
      { message_id: 'm22', direction: 'inbound', sender: '+1 (555) 111-2222', text: 'I need to book a brake inspection for my Honda Civic', message_type: 'text', timestamp: '2026-06-21T10:20:00Z' },
    ],
  },
  'conv-6': {
    conversation: MOCK_CONVERSATIONS['tenant-b-automotive-care'][1],
    messages: [
      { message_id: 'm23', direction: 'inbound', sender: '+1 (555) 333-4444', text: 'Can you send me the repair diagram for the engine?', message_type: 'text', timestamp: '2026-06-21T09:00:00Z' },
      { message_id: 'm24', direction: 'outbound', sender: 'bot', text: 'Sure thing! Here\'s the engine diagnostic overview for reference:', message_type: 'text', timestamp: '2026-06-21T09:00:10Z' },
      { message_id: 'm25', direction: 'outbound', sender: 'bot', text: '', message_type: 'image', media: { url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400', mime_type: 'image/jpeg' }, timestamp: '2026-06-21T09:00:12Z' },
    ],
  },
};
