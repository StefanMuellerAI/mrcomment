import OpenAI from "openai";

interface GeneratedComment {
  id: number;
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

/**
 * Generiert eine stilistische Analyse basierend auf LinkedIn-Beispielen
 */
export const generateStyleAnalysis = async (examples: string[]): Promise<string> => {
  try {
    const response = await openai.chat.completions.create({
      model: "o4-mini",
      messages: [
        {
          "role": "developer",
          "content": [
            {
              "type": "text",
              "text": "Du bist ein hilfreicher KI-Assistent, der die folgenden 3 LinkedIn-Beiträge des Kunden stilistisch analysiert, damit eine KI Beiträge schreiben kann, die exakt so klingen und aufgebaut sind. Lasse kein Detail aus, mag es noch so unbedeutend sein. Je besser später der individuelle Stil nachempfunden werden kann, desto besser. "
            }
          ]
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `Analysiere nun diese 3 Beiträge:\n${examples.join('\n\n')}`
            }
          ]
        }
      ],
      response_format: {
        "type": "text"
      },
      reasoning_effort: "high"
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Error generating style analysis:', error);
    throw new Error('Fehler bei der Stilanalyse');
  }
};

/**
 * Generiert Kommentare für einen LinkedIn-Post basierend auf dem Kundenprofil
 */
export const generateComments = async (customerName: string, styleAnalysis: string, linkedInPost: string): Promise<GeneratedComment[]> => {
  try {
    const response = await openai.chat.completions.create({
      model: "o4-mini",
      messages: [
        {
          "role": "system",
          "content": [
            {
              "type": "text",
              "text": `Du bist ein LinkedIn Content Creator, der für den mitgelieferten Text 6 Kommentare schreibt. Diese müssen die folgenden Regeln einhalten:
               1. negative und neutrale Kommentere müssen kurz und bündig (maximal 1-2 Sätze) sein. Positive Kommentare müssen 5 Sätze haben. 
               2. Der Kommentar muss den Turing Test bestehen. 
               3. Er darf nicht werblich klingen oder gängige Marketingphrasen enthalten. 
               4. Der Kommentar darf sich selbst nicht ganz so ernst nehmen. 
               5. Kommentare 1 und 2 sollten positiv, Kommentare 3 und 4 sollten neutral und Kommentare 5 und 6 sollten negativ sein. 
               6. Der Kommentar muss klingen, wie Menschen sprechen, nicht wie Menschen schreiben. 
               7. Eine konkrete Satzstruktur muss nicht beachtet werden. 
               8. Lasse den Kommentar so klingen, wie die Stilanalyse sagt. 
               9. Achtung, der Name aus der Stilanalyse und den hinterlegten Beiträgen ist nicht gleichbedeutend mit dem Author des Posts, der kommentiert werden soll.`
            }
          ]
        },
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `Kundenprofil:
Name: ${customerName}
Stilanalyse: ${styleAnalysis}

LinkedIn Post für den du die Kommentare schreibst:
${linkedInPost}`
            }
          ]
        }
      ],
      response_format: {
        "type": "json_schema",
        "json_schema": {
          "name": "linkedin_comments",
          "strict": true,
          "schema": {
            "type": "object",
            "properties": {
              "comments": {
                "type": "array",
                "description": "A list of exactly three comments on the LinkedIn post.",
                "items": {
                  "type": "object",
                  "properties": {
                    "content": {
                      "type": "string",
                      "description": "The text content of the comment."
                    },
                    "timestamp": {
                      "type": "string",
                      "description": "The time when the comment was made."
                    }
                  },
                  "required": [
                    "content",
                    "timestamp"
                  ],
                  "additionalProperties": false
                }
              }
            },
            "required": [
              "comments"
            ],
            "additionalProperties": false
          }
        }
      }
    });

    const result = response.choices[0].message.content;
    if (!result) throw new Error('No response from OpenAI');
    
    const parsedResult = JSON.parse(result) as {
      comments: Array<{
        content: string;
        timestamp: string;
      }>;
    };

    return parsedResult.comments.map((comment, index: number) => {
      // Determine sentiment based on comment position
      let sentiment: 'positive' | 'neutral' | 'negative';
      if (index < 2) {
        // First two comments - positive
        sentiment = 'positive';
      } else if (index < 4) {
        // Middle two comments - neutral
        sentiment = 'neutral';
      } else {
        // Last two comments - negative
        sentiment = 'negative';
      }
      
      return {
        id: index + 1,
        text: comment.content,
        sentiment
      };
    });
  } catch (error) {
    console.error('Error generating comments:', error);
    throw new Error('Fehler bei der Generierung der Kommentare');
  }
};

export default {
  generateStyleAnalysis,
  generateComments
}; 