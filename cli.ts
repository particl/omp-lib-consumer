import "shelljs";
import chalk from "chalk";
import figlet = require("figlet");
import inquirer = require("inquirer");
import terminalImage = require("terminal-image");
import got = require("got");
import { doBid, items, acceptAndEagerlyRequestRelease, lockAndEagerlyRequestRefund } from "./core";

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const init = () => {
  console.log(
    chalk.green(
      figlet.textSync("Open   Market   Protocol", {
        horizontalLayout: "default",
        verticalLayout: "default"
      })
    )
  );
};

const askInitialization = () => {
  const questions = [
    {
      name: "name",
      type: "input",
      message: "Hi there, what should I call you?"
    },
    {
        type: "list",
        name: "ok",
        message: "Are you running the testing environment?",
        choices: ["no", "yes"]
    },
  ];
  return inquirer.prompt(questions);
};

const askListing = async (listing: any) => {
    const {body} = await got(listing.action.item.information.images[0].data[0].id, {encoding: null});
    const img = await terminalImage.buffer(body);
    console.log(chalk.white.bold(`----------------------------------------------------------------`))
    console.log(chalk.white.bgGreen.bold(` NEW `) +' '+ chalk.green.bold(listing.action.item.information.title) + ' ' + chalk.white.bgRed.bold(` HOT `))
    console.log(img);
    console.log(chalk.white.bold(`----------------------------------------------------------------`))
    console.info(chalk.white.bold(JSON.stringify(listing, undefined, 4)))
    console.log(chalk.white.bold(`----------------------------------------------------------------`))
    const questions = [
      {
          type: "list",
          name: "BUY",
          message: "Do you want to bid on this item?",
          choices: ["Yes", "AWMAGAWDOFCOURSE"]
      },
    ];
    return inquirer.prompt(questions);
  };

const run = async () => {
    // show script introduction
    init();
  
    // ask questions
    const answers = await askInitialization();
    const { name, ok } = <any> answers;

    if (ok === "no") {
        console.log(chalk.red.bold(`${name}! You should be running the testing environment!`))
        process.exit(1);
    }
 
    console.log(chalk.white.bold(`I'm glad you made it so far!`))
    await sleep(2000);
    console.log(chalk.white.bold(`Are you interested to see what we have in store?!`))
    await sleep(2000);
    console.log(chalk.white.bold(`Oh boy, it's your lucky day!`))
    await sleep(500);
    console.log(chalk.red.bold(`This may take a few seconds....`))


    for (let i = 0; i < items.length; i++) {
        const listing = items[i];
        await askListing(listing);
        const bid = await doBid(listing, name)
        console.log(chalk.white.bold(`----------------------------------------------------------------`))
        console.info(chalk.yellow.bold(JSON.stringify(bid, undefined, 4)))
        console.log(chalk.white.bold(`----------------------------------------------------------------`))
        await sleep(2000)

        console.log(chalk.white.bgRed.bold(` WAITING FOR SELLER TO REPLY WITH ACCEPT AND RELEASE INFORMATION ...`));
        await sleep(2000)
        console.log(chalk.white.bgRed.bold(` ...`));
        await sleep(2000)
        console.log(chalk.white.bgRed.bold(` ...`));
        await sleep(2000)

        const ar = await acceptAndEagerlyRequestRelease(listing, bid)
        const accept = ar[0];
        const release = ar[1];
        console.log(chalk.white.bold(`----------------------------------------------------------------`))
        console.info(chalk.magenta.bold(JSON.stringify(accept, undefined, 4)))
        console.log(chalk.white.bold(`----------------------------------------------------------------`))
        console.info(chalk.green.bold(JSON.stringify(release, undefined, 4)))
        console.log(chalk.white.bold(`----------------------------------------------------------------`))
        await sleep(2000)

        console.log(chalk.white.bgGreen.bold(` AUTOMATICALLY LOCKING AND EAGERLY DISCLOSING REFUND INFORMATION ...`));

        await sleep(2000)
        console.log(chalk.white.bgGreen.bold(` ...`));
        await sleep(2000)
        console.log(chalk.white.bgGreen.bold(` ...`));
        await sleep(2000)

        const rltx = await lockAndEagerlyRequestRefund(listing, bid, accept)
        const lock = rltx[0];
        const rawlocktx = rltx[1];
        const refund = rltx[2];
        console.log(chalk.white.bold(`----------------------------------------------------------------`))
        console.info(chalk.blue.bold(JSON.stringify(lock, undefined, 4)))
        console.log(chalk.white.bold(`----------------------------------------------------------------`))
        console.info(chalk.green.bold(JSON.stringify(refund, undefined, 4)))
        console.log(chalk.white.bold(`----------------------------------------------------------------`))
        await sleep(2000)

        console.log(chalk.white.bgGreen.bold(` SUBMITTING LOCK TRANSACTION TO THE NETWORK ...`));
        console.log(chalk.white.bgGreen.bold(rawlocktx));


    }


    
  };
  
  run();
