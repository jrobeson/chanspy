const { Sequelize, Op } = require('sequelize');

const sequelize = new Sequelize('quote', null, null, {
  dialect: 'sqlite',
  storage: `${__dirname}/../data/quote.sqlite`,
});

const latestMessageModel = sequelize.define('latest_message', {
  user: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false,
  },
  text: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

const quoteModel = sequelize.define('quote', {
  user: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  text: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  date: {
    type: Sequelize.DATE,
    allowNull: false,
  },
});

function initializeQuoteDatabase() {
  return sequelize.sync();
}

function cleanStaleLatestMessages() {
  return latestMessageModel.destroy({
    where: {
      updatedAt: {
        [Op.lt]: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
    },
  });
}

function updateLatestMessage(user, text) {
  return latestMessageModel.upsert({
    user: user,
    text: text,
  });
}

async function storeLatestMessageAsQuote(user) {
  const latestMessage = await latestMessageModel.findOne({
    where: {
      user: user,
    },
  });
  if (latestMessage === null) {
    return Promise.resolve(false);
  }
  await sequelize.transaction(async (t) => {
    await quoteModel.create(
      {
        user: latestMessage.user,
        text: latestMessage.text,
        date: latestMessage.updatedAt,
      },
      {
        transaction: t,
      }
    );
    await latestMessage.destroy({ transaction: t });
  });
  return Promise.resolve(true);
}

function retrieveQuote(user) {
  const findOneOptions = {
    order: sequelize.random(),
  };
  if (user !== '') {
    findOneOptions.where = Sequelize.where(
      Sequelize.fn('lower', Sequelize.col('user')),
      Sequelize.fn('lower', user)
    );
  }
  return quoteModel.findOne(findOneOptions);
}

module.exports.initializeQuoteDatabase = initializeQuoteDatabase;
module.exports.cleanStaleLatestMessages = cleanStaleLatestMessages;
module.exports.updateLatestMessage = updateLatestMessage;
module.exports.storeLatestMessageAsQuote = storeLatestMessageAsQuote;
module.exports.retrieveQuote = retrieveQuote;
