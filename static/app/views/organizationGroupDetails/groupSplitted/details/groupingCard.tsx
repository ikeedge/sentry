import styled from '@emotion/styled';

import Card from 'app/components/card';
import {Panel} from 'app/components/panels';
import TextOverflow from 'app/components/textOverflow';
import {t} from 'app/locale';
import {ChildFingerprint} from 'app/stores/groupingStore';
import space from 'app/styles/space';

type Props = {
  label: string;
  groupings: ChildFingerprint[];
};

function GroupingCard({label, groupings}: Props) {
  return (
    <StyledCard interactive>
      <Header>
        <Label>{label}</Label>
        <Description>{t('This is a description')}</Description>
      </Header>
      <Body>
        {groupings.map((grouping, index) => (
          <SubCard key={index}>
            <div>
              <strong>{t('Issue %s: ', index + 1)}</strong>
              <span>{grouping.childId}</span>
            </div>
          </SubCard>
        ))}
      </Body>
    </StyledCard>
  );
}

export default GroupingCard;

const Header = styled('div')`
  padding: ${space(1.5)} ${space(2)};
  border-bottom: 1px solid ${p => p.theme.gray100};
  display: grid;
  grid-gap: ${space(1)};
`;

const Body = styled('div')``;

const StyledCard = styled(Card)``;

const Label = styled(TextOverflow)`
  font-size: ${p => p.theme.fontSizeLarge};
  font-weight: 700;
`;

const Description = styled('div')`
  font-size: ${p => p.theme.fontSizeMedium};
`;

const SubCard = styled('div')`
  background: ${p => p.theme.bodyBackground};
  padding: ${space(1.5)} ${space(2)};
  border-bottom: 1px solid ${p => p.theme.gray100};
`;
