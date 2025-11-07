/**
 * Simple test script for the Harmony 2.0 Master Agent API
 * Run: node test-api.js
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing Harmony 2.0 Master Agent API\n');

  // Test 1: Health Check
  console.log('1️⃣ Testing Health Check...');
  try {
    const healthRes = await fetch(`${API_URL}/health`);
    const health = await healthRes.json();
    console.log('✅ Health Check:', health);
  } catch (error) {
    console.error('❌ Health Check failed:', error.message);
    return;
  }

  // Test 2: Chat
  console.log('\n2️⃣ Testing Chat...');
  try {
    const chatRes = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'What is Harmony 2.0?',
      }),
    });
    const chat = await chatRes.json();
    console.log('✅ Chat Response:', chat.response.substring(0, 200) + '...');
  } catch (error) {
    console.error('❌ Chat failed:', error.message);
  }

  // Test 3: Analyze Code
  console.log('\n3️⃣ Testing Code Analysis...');
  try {
    const analyzeRes = await fetch(`${API_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'function hello() { return "world"; }',
        language: 'javascript',
      }),
    });
    const analyze = await analyzeRes.json();
    console.log('✅ Analysis Response:', analyze.response.substring(0, 200) + '...');
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }

  // Test 4: Generate Code
  console.log('\n4️⃣ Testing Code Generation...');
  try {
    const generateRes = await fetch(`${API_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: 'Create a simple React button component',
        componentType: 'component',
      }),
    });
    const generate = await generateRes.json();
    console.log('✅ Generation Response:', generate.response.substring(0, 200) + '...');
  } catch (error) {
    console.error('❌ Generation failed:', error.message);
  }

  // Test 5: Get Guidance
  console.log('\n5️⃣ Testing Guidance...');
  try {
    const guidanceRes = await fetch(`${API_URL}/api/guidance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: 'project setup',
      }),
    });
    const guidance = await guidanceRes.json();
    console.log('✅ Guidance Response:', guidance.response.substring(0, 200) + '...');
  } catch (error) {
    console.error('❌ Guidance failed:', error.message);
  }

  console.log('\n✨ Testing complete!');
}

// Run tests
testAPI().catch(console.error);

