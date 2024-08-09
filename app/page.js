"use client"

import { Box, Stack, TextField, Button } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm your professional credit card recommender. How can I assist you in finding the perfect credit card today?" }
  ]);

  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  const creditCardKeywords = ["credit card", "cash back", "APR", "rewards", "balance transfer", "annual fee", "card"];

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const isRelevantToCreditCards = (message) => {
    return creditCardKeywords.some(keyword => message.toLowerCase().includes(keyword));
  };

  const sendMessage = async () => {
    const newMessages = [...messages, { role: "user", content: message }];
    setMessages(newMessages);
    setMessage('');  // Clear the input field after sending the message

    if (!isRelevantToCreditCards(message)) {
      const warningMessage = "I'm only able to assist you with credit card-related questions. How can I help you today?";
      setMessages(prevMessages => [...prevMessages, { role: "assistant", content: warningMessage }]);
      return;
    }

    const response = await fetch('/api', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newMessages)
    });

    if (response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: '' }
      ]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          const lastMessageIndex = updatedMessages.length - 1;
          updatedMessages[lastMessageIndex].content = result;
          return updatedMessages;
        });

        await delay(100);  // Adjust the delay duration as needed
      }

      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        const lastMessageIndex = updatedMessages.length - 1;
        updatedMessages[lastMessageIndex].content = result.trim();
        return updatedMessages;
      });
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor="#f5f5f5"
    >
      <Stack 
        direction="column" 
        width="600px" 
        height="800px" 
        bgcolor="white" 
        boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)" 
        borderRadius={8} 
        p={3} 
        spacing={3}
      >
        <Stack direction="column" spacing={3} flexGrow={1} overflow="auto" maxHeight="800px">
          {
            messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={message.role === "assistant" ? "flex-start" : "flex-end"}
              >
                <Box
                  bgcolor={message.role === "assistant" ? "#004080" : "#0066cc"}
                  color="white"
                  borderRadius={14}
                  p={4}
                  maxWidth="80%"
                  maxHeight= "100%"
                  boxShadow="0 2px 6px rgba(0, 0, 0, 0.1)"
                  style={{
                    lineHeight: 1.9,  // Increase line height for better readability
                    marginBottom: '16px', // Add spacing between messages
                    fontSize: '16px',  // Decrease font size
                  }}
                >
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </Box>
              </Box>
            ))
          }
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction="row" spacing={2}>
          <TextField 
            label="Type your message..." 
            fullWidth 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
            variant="outlined"
            InputProps={{
              style: {
                borderRadius: 16,
              },
            }}
          />
          <Button 
            variant="contained" 
            onClick={sendMessage}
            style={{
              backgroundColor: "#0066cc",
              color: "white",
              borderRadius: 16,
              padding: "8px 24px",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)"
            }}
          >
            Send
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
