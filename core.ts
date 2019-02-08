import { node0, node1, OpenMarketProtocol, Cryptocurrency, BidConfiguration, EscrowType } from 'omp-lib';
import 'process';


// We create an instance of the open market protocol
// This is essentially the object against which we'll
// be executing everything.
const seller = new OpenMarketProtocol();


// Currently it doesn't have any knowledge of any 
// particular cryptocurrency, so we must register one
// We'll use particl in this example.
seller.inject(Cryptocurrency.PART, node1);
// node0 is not something you want to use in production
// instead you pass your CoreRpcService in here as a
// reference, it can point to any wallet, etc.
// Just for the purpose of the demo, I've export node0
// which points to a regnet node.


// We build our own listing in JSON, the format must match
// what OpenMarketProtocol expects. Else it will get rejected.
export const items = [
  {
    version: "0.1.0.0",
    action: {
      type: "MPA_LISTING_ADD",
      item: {
        information: {
          title: "Ignite 9 inch vibrating dildo",
          shortDescription: "Sometimes you want to get off with something that looks like a penis, and not have to deal with a human attached. Why not make that penis purple? Not only does this dildo vibrate, but it comes with a suction cup, so you can stick it to your floor, your bathtub, and have penetrative sex with no dating involved.",
          longDescription: "No long description required for this massive dildo",
          category: [
            "Animals"
          ],
          images: [
            {
              hash: "17f29e7ad4bce777e90d9c2514e58776d467092060b361c14cf45292353ef2c5",
              data: [
                {
                  protocol: 'URL',
                  id: 'https://transfer.sh/PzuOZ/deletemetroll.png'
                }
              ]
            }
          ]
        },
        payment: {
          type: "SALE",
          escrow: {
            type: "MULTISIG",
            ratio: {
              buyer: 100,
              seller: 100
            }
          },
          cryptocurrency: [
            {
              currency: "PART",
              basePrice: 2000000000
            }
          ]
        },
        messaging: [
          {
            protocol: "TODO",
            publicKey: "TODO"
          }
        ]
      }
    }
  }
];



// Alice goes shopping and finds herself the 9 inch anal cavitity destroyer dildo.
// She seems pleased with its purple looks and the 30 days return policy.
const alice = new OpenMarketProtocol();
alice.inject(Cryptocurrency.PART, node0);



// Alice decides to do a bid on the dildo.
// She first construct a bid configuration object.
export async function doBid(listing: any, name: string) {

  // Alice is a smart girl, she knows that she has to verify the messages
  // to make sure they are of the right format. Perhaps Bob put some evil stuff in his listing!
  // Alice technically doesn't have to do that, that's every function is ensured to do sanity checks.
  // Before acting on the message.

  try {
    const valid = OpenMarketProtocol.verify([listing]);
    console.info(valid)
  } catch (e) {
    console.error(e)
  }


  const config = {
    cryptocurrency: Cryptocurrency.PART,
    escrow: EscrowType.MULTISIG,
    shippingAddress: {
      firstName: name,
      lastName: 'Clitoris',
      addressLine1: 'PoundMyAss 6',
      city: 'RUN TRAIN ON ME',
      state: 'New York',
      zipCode: '6969',
      country: 'USA'
    }
  }

  // Alice then tries to create a bid message.
  // All actions except strip() can throw errors!
  let bid;
  try {
    bid = await alice.bid(config, listing);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }

  // Please note the fields that start with "_"; these are private fields.
  // We must strip them out!
  return OpenMarketProtocol.strip(<any>bid);
}


  // So this is were your application takes the output of bid, strips it, and forwards it to the seller.
  // Our seller "DildoCorpUSA" has received the bid and decided that Alice her order is accepted.
  // They are eager to have their money, so they can actually already provide their part of the release transaction.
export async function acceptAndEagerlyRequestRelease(listing: any, bid: any): Promise<any[]> {
  let accept;
  let release;
  try {
    accept = OpenMarketProtocol.strip(await seller.accept(listing, bid));
    release = OpenMarketProtocol.strip(await seller.release(listing, bid, accept));
  } catch (e) {
    console.error(e);
  }

  return [accept, release]
}

  // Alice is a smarty pants too, she's going to lock the escrow and agree to the deal.
  // But she's also a rational actor and just signs the refund request already. 
export async function lockAndEagerlyRequestRefund(listing: any, bid: any, accept: any): Promise<any[]> {
  let lock;
  let finalRawTx: string = "";
  let refund;
  try {
    lock = await alice.lock(listing, bid, <any>accept);
    finalRawTx = lock._rawtx ? lock._rawtx : "";
    lock = OpenMarketProtocol.strip(lock);

    refund = OpenMarketProtocol.strip(await alice.refund(listing, bid, <any>accept));

    console.info(JSON.stringify(lock, undefined, 4))
    console.info(JSON.stringify(finalRawTx, undefined, 4))
    console.info(JSON.stringify(refund, undefined, 4))
  } catch (e) {
    console.error(e);
  }
  return [lock, finalRawTx, refund];
}


// It's highly adviced to automatically strip outgoinging messages
// It won't hurt.
function SecurePostMessage(msg: any) {
  const safe = OpenMarketProtocol.strip(msg);
  const encoded = JSON.stringify(safe);
  // Now actually really post the message to the network.
}
