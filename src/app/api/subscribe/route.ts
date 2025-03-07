import { NextResponse } from "next/server";

interface Subscription {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

const subscriptions: Subscription[] = [];

export async function POST(req: Request) {
    try {
        const subscription = await req.json();
        subscriptions.push(subscription);

        console.log("🔔 Novo usuário inscrito:", subscription);
        return NextResponse.json({ message: "Inscrição salva!" }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erro ao inscrever usuário" }, { status: 500 });
    }
}


