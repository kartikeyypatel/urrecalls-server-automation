import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';

function extractEmailText(): String {
  console.log('accessing email via gmail api');
  return 'body from email';
}

function extractData(emailBody: String): Object {
  console.log('using OpenAI API to parse extract relevant data');
  return { upc: '12345', manufactuer: 'njit' };
}

function insertDatabase(data: Object) {
  console.log(`inserting ${JSON.stringify(data)} into dynamodb`);
}

export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);

  const text: String = extractEmailText();

  const data: Object = extractData(text);

  insertDatabase(data);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'hello world',
    }),
  };
};
