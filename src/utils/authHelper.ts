import clientPromise from './mongodb';

interface UserToken {
  googleEmail: string;
  keycloakAccessToken: string;
  keycloakRefreshToken: string;
  expiresAt: number;
}

export async function storeKeycloakToken(
  googleEmail: string,
  keycloakAccessToken: string,
  keycloakRefreshToken: string,
  expiresIn: number
) {
  try {
    const client = await clientPromise;
    const db = client.db('Cluster0');  // MongoDB 연결된 기본 데이터베이스 이름
    const collection = db.collection<UserToken>('userTokens');

    const expiresAt = Date.now() + expiresIn * 1000;

    await collection.updateOne(
      { googleEmail },
      {
        $set: {
          keycloakAccessToken,
          keycloakRefreshToken,
          expiresAt,
        },
      },
      { upsert: true }  // 존재하지 않으면 새로 삽입
    );

    console.log('Keycloak 토큰이 MongoDB에 저장되었습니다.');
  } catch (error) {
    console.error('MongoDB에 토큰 저장 중 오류 발생:', error);
  }
}

export async function storeUserInDB(email: string, name: string | null, provider: string) {
  try {
    const client = await clientPromise;
    const db = client.db('Cluster0');  // MongoDB 연결된 기본 데이터베이스 이름
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({ email });

    if (!existingUser) {
      await usersCollection.insertOne({
        email,
        name,
        provider,
        createdAt: new Date(),
      });
      console.log('사용자 정보가 MongoDB에 저장되었습니다.');
    } else {
      console.log('이미 존재하는 사용자입니다.');
    }
  } catch (error) {
    console.error('MongoDB 사용자 저장 중 오류 발생:', error);
  }
}
