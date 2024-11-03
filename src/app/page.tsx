"use client"

import { getPublicKey } from 'nostr-tools/pure'
import { useEffect, useState } from 'react'
import { nip19 } from "nostr-tools"
import { finalizeEvent, verifyEvent } from 'nostr-tools/pure'


// export async function generateMetadata(): Promise<Metadata> {
//   return {
//     title: 'Index page',
//   };
// }

// const defaultProps = {
//   title: "Static page",
//   msg:"This is static page smaple."

// }

import { Relay } from 'nostr-tools/relay'
const skHex = 'nsec1l365d5pyh4c9ysqzlaah0epx0kxl4gy78ssaxxs28ymxdhcpkgvqyvncl9'
const secretKey = nip19.decode(skHex).data
// const encodeSk = nip19.nsecEncode(secretKey)
const publicKey = getPublicKey(secretKey)

 async function getRelay() {
  const relay = await Relay.connect('wss://nos.lol')
  console.log(`connected to ${relay.url}`)
  return relay;
}


// const event = finalizeEvent({
//         kind: 1,
//         created_at: Math.floor(Date.now() / 1000),
//         tags: [],
//         content: 'I tried to use nostr-tools',
//       }, secretKey)

// const isGood = verifyEvent(event)
// console.log('isGood', isGood)

// let's query for an event that exists

// const eventTemplate = {
//   kind: 1,
//   created_at: Math.floor(Date.now() / 1000),
//   tags: [],
//   content: 'I tried to use nostr-tools',
// }

export default function Home() {
  const [input, setInput] = useState("")
  const [message, setMessage] = useState("")
  const [relay, setRelay] = useState<Relay | null>(null)

  const doChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value)
  }
  const doClick = async () => {
    if (relay) {
      const eventTemplate = {
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: input,
      }
      const signedEvent = finalizeEvent(eventTemplate, secretKey)
      const isGood = verifyEvent(signedEvent)
      console.log('isGood', isGood)
      await relay.publish(signedEvent)
      setMessage(input + " published")
      setInput("")
    } else {
      console.error("Relay is not connected")
    }
  }
  const [events, setEvents] = useState<string[]>([])

  useEffect(() => {
    const initializeRelay = async () => {
      const relayInstance = await getRelay()
      setRelay(relayInstance)
      relayInstance.subscribe([
        {
          kinds: [1],
          authors: [publicKey],
        },
      ], {
        onevent(event) {
          console.log('got event:', event.content)
          setEvents(prevEvents => [...prevEvents, event.content])
        }
      })

      // const signedEvent = event ? finalizeEvent(event, secretKey) : null
      // console.log('signedEvent', signedEvent)
      //await relay.publish(signedEvent)
      //relay.close()
    }
    initializeRelay()

  }, [])


  return (
     <main>
      <h1 className="title">My Page</h1>
      <div className="m-5 flex justify-center">
        <input type="text" value={input} onChange={doChange} className="p-1 border-solid border-2 border-gray-400"/>
        <button onClick={doClick} className="px-7 py-2 mx-2 bg-blue-800 text-white rounded-lg">Publish</button>
      </div>
      <p className="message">{message}</p>
      <ul>
        {events.map((eventContent, index) => (
          <li key={index}>{eventContent}</li>
        ))}
      </ul>
      </main>
  );
}
