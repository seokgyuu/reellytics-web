import { NextResponse } from 'next/server';

export async function GET(req: any) {
	const token = req.headers.get('authorization').split(' ')[1];
	const res = decodeJwt(token);

	return NextResponse.json({ res }, { status: 200 });
}

function decodeJwt(token: string) {
	const parts = token.split('.');
	if (parts.length !== 3) {
		throw new Error('The token is invalid');
	}

	const header = JSON.parse(atob(parts[0]));
	const payload = JSON.parse(
		Buffer.from(parts[1], 'base64').toString('utf8'),
	);

	return { header, payload };
}