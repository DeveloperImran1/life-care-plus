const getTokenMaxAge = (tokenExpiresIn: string) => {
  let tokenMaxAge: number;
  const tokenUnit = tokenExpiresIn.slice(-1);
  const accessTokenValue = parseInt(tokenExpiresIn.slice(0, -1));
  if (tokenUnit === 'y') {
    tokenMaxAge = accessTokenValue * 365 * 24 * 60 * 60 * 1000;
  } else if (tokenUnit === 'M') {
    tokenMaxAge = accessTokenValue * 30 * 24 * 60 * 60 * 1000;
  } else if (tokenUnit === 'w') {
    tokenMaxAge = accessTokenValue * 7 * 24 * 60 * 60 * 1000;
  } else if (tokenUnit === 'd') {
    tokenMaxAge = accessTokenValue * 24 * 60 * 60 * 1000;
  } else if (tokenUnit === 'h') {
    tokenMaxAge = accessTokenValue * 60 * 60 * 1000;
  } else if (tokenUnit === 'm') {
    tokenMaxAge = accessTokenValue * 60 * 1000;
  } else if (tokenUnit === 's') {
    tokenMaxAge = accessTokenValue * 1000;
  } else {
    tokenMaxAge = 1000 * 60 * 60; // default 1 hour
  }

  return tokenMaxAge;
};

export default getTokenMaxAge;
