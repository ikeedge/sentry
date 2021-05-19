import {Fragment} from 'react';
import {css} from '@emotion/react';
import styled from '@emotion/styled';

import Tooltip from '../tooltip';

import {ParseResult, parseSearch, Token, TokenResult} from './parser';

class ResultRenderer {
  renderFilter = (filter: TokenResult<Token.Filter>) => (
    <FilterToken>
      {filter.negated && <Negation>!</Negation>}
      <Tooltip title="key">
        <Key negated={filter.negated}>{filter.key.text}</Key>
      </Tooltip>
      <Operator>{`:${filter.operator}`}</Operator>
      <Value>{this.renderToken(filter.value)}</Value>
    </FilterToken>
  );

  renderList = (token: TokenResult<Token.ValueNumberList | Token.ValueTextList>) => (
    <InList>
      {token.items.map(({value, separator}) => [
        <ListComma key="comma">{separator}</ListComma>,
        this.renderToken(value),
      ])}
    </InList>
  );

  renderNumber = (token: TokenResult<Token.ValueNumber>) => (
    <Number>
      {token.value}
      <Unit>{token.unit}</Unit>
    </Number>
  );

  renderToken = (token: TokenResult<Token>) => {
    switch (token.type) {
      case Token.Filter:
        return this.renderFilter(token);

      case Token.LogicGroup:
        return <LogicGroup>{this.renderResult(token)}</LogicGroup>;

      case Token.LogicBoolean:
        return <LogicBoolean>{token.value}</LogicBoolean>;

      case Token.ValueIso8601Date:
        return <DateTime>{token.text}</DateTime>;

      case Token.ValueTextList:
      case Token.ValueNumberList:
        return this.renderList(token);

      case Token.ValueNumber:
        return this.renderNumber(token);

      default:
        return token.text;
    }
  };

  renderResult = (result: ParseResult) =>
    result
      .map(token => (typeof token === 'string' ? token : this.renderToken(token)))
      .map((item, i) => <Fragment key={i}>{item}</Fragment>);
}

export default function renderQuery(query: string) {
  try {
    const parseResult = parseSearch(query);

    console.log(parseResult);

    return new ResultRenderer().renderResult(parseSearch(query));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
    return query;
  }
}

const FilterToken = styled('span')`
  line-height: 19px;
  display: inline-block;
  margin: 0 -3px;
  padding: 0 3px;
`;

const Negation = styled('span')`
  display: inline-block;
  background: rgb(241 51 51 / 20%);
  border-radius: 2px 0 0 2px;
  margin-left: -3px;
  padding-left: 3px;
`;

const Key = styled('span')<{negated: boolean}>`
  display: inline-block;
  background: rgb(231 225 236 / 40%);
  font-weight: bold;
  ${p =>
    !p.negated &&
    css`
      border-radius: 2px 0 0 2px;
      margin-left: -3px;
      padding-left: 3px;
    `};
`;

const Operator = styled('span')`
  display: inline-block;
  background: rgb(231 225 236 / 40%);
  color: ${p => p.theme.red300};
`;

const Value = styled('span')`
  display: inline-block;
  background: rgb(231 225 236 / 40%);
  color: #3c3642;
  border-radius: 0 2px 2px 0;
  margin-right: -3px;
  padding-right: 3px;
`;

const Number = styled('span')`
  color: ${p => p.theme.orange300};
`;

const Unit = styled('span')`
  font-weight: bold;
  color: ${p => p.theme.orange400};
`;

const LogicBoolean = styled('span')`
  font-weight: bold;
  color: ${p => p.theme.red300};
`;

const DateTime = styled('span')`
  color: ${p => p.theme.green300};
`;

const ListComma = styled('span')`
  color: ${p => p.theme.gray300};
`;

const InList = styled('span')`
  &:before {
    content: '[';
    color: ${p => p.theme.blue300};
  }
  &:after {
    content: ']';
    color: ${p => p.theme.blue300};
  }
`;

const LogicGroup = styled('span')`
  &:before {
    content: '(';
    color: ${p => p.theme.green300};
  }
  &:after {
    content: ')';
    color: ${p => p.theme.green300};
  }
`;
